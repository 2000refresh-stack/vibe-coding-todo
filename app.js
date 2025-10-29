// Firebase SDK 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBdiX_dFf2Jw3R49UyytW7a3iN4Xgu6nK0",
    authDomain: "code-todo-backend.firebaseapp.com",
    projectId: "code-todo-backend",
    storageBucket: "code-todo-backend.firebasestorage.app",
    messagingSenderId: "473531126913",
    appId: "1:473531126913:web:558d5790f9f0ceda0c2980",
    measurementId: "G-KPML5NRYCS",
    databaseURL: "https://code-todo-backend-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app); // Realtime Database 사용

// Firebase 연결 상태 확인 함수
async function checkFirebaseConnection() {
    // UI 상태 업데이트
    const updateConnectionStatus = (isConnected, message) => {
        const statusElement = document.getElementById('connectionStatus');
        const indicator = statusElement?.querySelector('.status-indicator');
        const text = statusElement?.querySelector('.status-text');
        
        if (statusElement && indicator && text) {
            indicator.className = 'status-indicator';
            if (isConnected) {
                indicator.classList.add('connected');
                text.textContent = message || '✅ Firebase 연결됨';
                text.style.color = '#4caf50';
            } else {
                indicator.classList.add('disconnected');
                text.textContent = message || '❌ Firebase 연결 실패';
                text.style.color = '#f44336';
            }
        }
    };
    
    try {
        // Realtime Database 연결 테스트
        const testRef = ref(db, '_test');
        
        // 타임아웃 설정 (5초)
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('연결 시간 초과')), 5000)
        );
        
        // get 호출로 연결 테스트
        const testPromise = get(testRef);
        
        await Promise.race([testPromise, timeoutPromise]);
        
        console.log('✅ Firebase Realtime Database 연결 성공!');
        console.log('📊 프로젝트:', firebaseConfig.projectId);
        console.log('🔥 Realtime Database 사용 가능');
        console.log('🌐 Database URL:', firebaseConfig.databaseURL);
        
        updateConnectionStatus(true, '✅ Firebase 연결됨');
        
        return true;
    } catch (error) {
        console.error('❌ Firebase 연결 실패:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        
        let errorMessage = '❌ Firebase 연결 실패';
        if (error.message === '연결 시간 초과') {
            errorMessage = '⏱️ 연결 시간 초과';
        } else if (error.code === 'permission-denied') {
            errorMessage = '🚫 권한 없음';
        } else if (error.code === 'unavailable') {
            errorMessage = '🌐 네트워크 오류';
        }
        
        updateConnectionStatus(false, errorMessage);
        
        // 사용자에게 알림 (중요한 오류만)
        if (error.code === 'PERMISSION_DENIED') {
            alert('Firebase 권한이 없습니다. Realtime Database 보안 규칙을 확인해주세요.');
        }
        
        return false;
    }
}

// 다른 파일에서 사용할 수 있도록 export
export { db, checkFirebaseConnection };
