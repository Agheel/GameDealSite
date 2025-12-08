import firebase_admin
from firebase_admin import credentials, firestore
import requests
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import time
import random
import re
import html
from concurrent.futures import ThreadPoolExecutor, as_completed

# --- 1. Firebase 설정 ---
if not os.path.exists("serviceAccountKey.json"):
    print("❌ [오류] serviceAccountKey.json 파일이 없습니다!")
    sys.exit(1)

cred = credentials.Certificate("serviceAccountKey.json")
try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(cred)
    
db = firestore.client()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. 헬퍼 함수들 ---

def clean_html(raw_html):
    if not raw_html: return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return html.unescape(cleantext)

# 스팀 정보 가져오기
def get_steam_details(steam_id):
    result = {
        "genres": ["Etc"],
        "description": "상세 설명이 제공되지 않는 게임입니다."
    }
    
    if not steam_id: return result
    
    try:
        url = f"http://store.steampowered.com/api/appdetails?appids={steam_id}&l=koreana"
        response = requests.get(url, timeout=3) 
        
        if response.status_code == 429:
            time.sleep(2) 
            return result

        data = response.json()
        if data and str(steam_id) in data and data[str(steam_id)]['success']:
            game_data = data[str(steam_id)]['data']
            
            genres_list = game_data.get('genres', [])
            if genres_list:
                result["genres"] = [g['description'] for g in genres_list]
            
            desc = game_data.get('short_description', '')
            if desc:
                result["description"] = clean_html(desc)
            
    except Exception:
        pass 
        
    return result

# 게임 1개 처리 (일꾼)
def process_single_game(item):
    if not item.get('dealID') or float(item.get('savings', 0)) == 0:
        return None 

    game_info = {
        "genres": ["Etc"],
        "description": "스팀 정보가 없는 게임입니다."
    }
    
    if item.get('steamAppID'):
        game_info = get_steam_details(item['steamAppID'])
        time.sleep(random.uniform(0.2, 0.5))

    return {
        'doc_id': item['dealID'],
        'data': {
            u'title': item['title'],
            u'salePrice': float(item['salePrice']),
            u'normalPrice': float(item['normalPrice']),
            u'savings': float(item['savings']),
            u'thumb': item['thumb'],
            u'steamAppID': item.get('steamAppID'),
            u'storeID': item['storeID'],
            u'dealID': item['dealID'],
            u'metacriticScore': int(item.get('metacriticScore', 0)),
            u'genre': game_info['genres'],
            u'description': game_info['description']
        }
    }

# --- 3. 메인 크롤링 함수 ---
def fetch_and_upload():
    print("🚀 [크롤링] GOG 제외 3대장(Steam, Epic, GMG) 집중 공략 시작...")
    
    start_time = time.time()
    total_processed = 0
    batch = db.batch()
    batch_count = 0

    # ⭐ GOG 삭제 완료! (Steam, Epic, GMG만 남김)
    target_stores = [
        {"id": "1", "name": "Steam", "pages": 30},
        {"id": "25", "name": "Epic", "pages": 30},
        {"id": "3", "name": "GMG", "pages": 30}
    ]

    try:
        with ThreadPoolExecutor(max_workers=4) as executor:
            
            for store in target_stores:
                print(f"   🔍 [{store['name']}] 데이터 수집 중 (최대 {store['pages']}페이지)...")
                
                for page in range(store['pages']):
                    url = f"https://www.cheapshark.com/api/1.0/deals?storeID={store['id']}&upperPrice=150&sortBy=Metacritic&onSale=1&pageNumber={page}"
                    
                    try:
                        deals = requests.get(url, timeout=10).json()
                        
                        if not deals:
                            print(f"      ✋ {store['name']} 할인 게임이 바닥났습니다. (페이지 {page}에서 종료)")
                            break 

                        futures = [executor.submit(process_single_game, item) for item in deals]
                        
                        for future in as_completed(futures):
                            result = future.result()
                            
                            if result:
                                doc_ref = db.collection(u'game_deals').document(result['doc_id'])
                                batch.set(doc_ref, result['data'])
                                batch_count += 1
                                total_processed += 1

                            if batch_count >= 400:
                                batch.commit()
                                batch = db.batch()
                                batch_count = 0
                                print(f"      💾 누적 {total_processed}개 저장 완료...")
                                
                    except Exception as e:
                        print(f"   ❌ API 오류 ({store['name']} Page {page}): {e}")
                        continue

        if batch_count > 0:
            batch.commit()
            
        end_time = time.time()
        print(f"✅ [완료] 총 {total_processed}개의 알짜배기 데이터 수집 끝! (소요시간: {int(end_time - start_time)}초)")
        
    except Exception as e:
        print(f"⚠️ 전체 에러 발생: {e}")

# --- 4. 실행 ---
@app.on_event("startup")
def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(fetch_and_upload, 'interval', hours=12)
    scheduler.start()
    
    import threading
    threading.Thread(target=fetch_and_upload).start()

@app.get("/")
def read_root():
    return {"status": "Running"}