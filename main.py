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
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
# 최신 방식(lifespan)을 위해 필요한 라이브러리
from contextlib import asynccontextmanager 
from deep_translator import GoogleTranslator

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

# --- 2. 헬퍼 함수들 ---

def clean_html(raw_html):
    if not raw_html: return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return html.unescape(cleantext)

def translate_to_korean(text):
    if not text: return "상세 설명이 없습니다."
    
    if re.search('[가-힣]', text):
        return text 

    try:
        translated = GoogleTranslator(source='auto', target='ko').translate(text)
        return translated
    except Exception as e:
        return text

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
                clean_desc = clean_html(desc)
                result["description"] = translate_to_korean(clean_desc)
            
    except Exception:
        pass 
        
    return result

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
    print("🚀 [크롤링] deep-translator 번역기 가동! 데이터 수집 시작...")
    
    start_time = time.time()
    total_processed = 0
    batch = db.batch()
    batch_count = 0

    target_stores = [
        {"id": "1", "name": "Steam", "pages": 30},
        {"id": "25", "name": "Epic", "pages": 30},
        {"id": "3", "name": "GMG", "pages": 30}
    ]

    try:
        with ThreadPoolExecutor(max_workers=4) as executor:
            
            for store in target_stores:
                print(f"   🔍 [{store['name']}] 데이터 수집 중...")
                
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
                                print(f"      💾 누적 {total_processed}개 저장 (번역 중)...")
                                
                    except Exception as e:
                        print(f"   ❌ API 오류 ({store['name']} Page {page}): {e}")
                        continue

        if batch_count > 0:
            batch.commit()
            
        end_time = time.time()
        print(f"✅ [완료] 총 {total_processed}개 수집 및 한글화 완료! (소요시간: {int(end_time - start_time)}초)")
        
    except Exception as e:
        print(f"⚠️ 전체 에러 발생: {e}")

# --- 4. 앱 설정 ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    # [시작될 때 실행]
    scheduler = BackgroundScheduler()
    scheduler.add_job(fetch_and_upload, 'interval', hours=12)
    scheduler.start()
    
    # 서버 켜지자마자 한 번 실행 (별도 스레드)
    threading.Thread(target=fetch_and_upload).start()
    
    yield # 앱 실행 중...
    
    # [종료될 때 실행]
    scheduler.shutdown()

# lifespan을 FastAPI에 등록
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)