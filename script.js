// Firebase Realtime Database 함수 가져오기
import { 
    ref, 
    set, 
    get, 
    update, 
    remove, 
    push, 
    onValue, 
    off 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

// Firebase 초기화된 db와 연결 확인 함수 가져오기
import { db, checkFirebaseConnection } from './app.js';

// 할일 데이터를 저장할 배열
let todos = [];

// Realtime Database 참조
const todosRef = ref(db, 'todos');

// DOM 요소 가져오기
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');
const clearCompleted = document.getElementById('clearCompleted');
const filterButtons = document.querySelectorAll('.filter-btn');

// 현재 필터 상태 (all, active, completed)
let currentFilter = 'all';

// 새 할일 추가 (Firebase Realtime Database 사용)
async function addTodo() {
    const text = todoInput.value.trim();
    
    // 빈 입력 처리
    if (text === '') {
        alert('할일을 입력해주세요!');
        todoInput.focus();
        return;
    }

    // 버튼 비활성화 (중복 클릭 방지)
    addBtn.disabled = true;
    addBtn.textContent = '추가 중...';

    try {
        // 새 할일 객체 생성
        const newTodo = {
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        // Realtime Database에 할일 추가 (push를 사용하여 자동으로 고유 키 생성)
        const newTodoRef = push(todosRef);
        await set(newTodoRef, newTodo);
        
        // 성공 메시지
        console.log('할일이 성공적으로 추가되었습니다:', newTodo);
        
        // 입력 필드 초기화
        todoInput.value = '';
        todoInput.focus();
        
        // 실시간 리스너가 자동으로 목록을 업데이트하므로 
        // 별도로 renderTodos()를 호출할 필요 없음
        
    } catch (error) {
        console.error('할일 추가 중 오류 발생:', error);
        
        // 에러 타입에 따른 메시지 분기
        let errorMessage = '할일 추가 중 오류가 발생했습니다.';
        if (error.code === 'PERMISSION_DENIED') {
            errorMessage = '권한이 없습니다. Firebase 설정을 확인해주세요.';
        } else if (error.code === 'UNAVAILABLE') {
            errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
        }
        
        alert(errorMessage);
    } finally {
        // 버튼 다시 활성화
        addBtn.disabled = false;
        addBtn.textContent = '추가';
    }
}

// 할일 삭제
async function deleteTodo(id) {
    // 확인 메시지
    if (!confirm('이 할일을 삭제하시겠습니까?')) {
        return;
    }

    try {
        // Realtime Database에서 할일 삭제
        const todoRef = ref(db, `todos/${id}`);
        await remove(todoRef);
    } catch (error) {
        console.error('할일 삭제 중 오류 발생:', error);
        alert('할일 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 할일 완료 상태 토글
async function toggleTodo(id) {
    try {
        // 현재 할일 찾기
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        // Realtime Database에서 할일 업데이트
        const todoRef = ref(db, `todos/${id}`);
        await update(todoRef, {
            completed: !todo.completed
        });
    } catch (error) {
        console.error('할일 상태 변경 중 오류 발생:', error);
        alert('할일 상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 할일 수정 모드 시작
function startEditTodo(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todo = todos.find(t => t.id === id);
    
    if (!todo) return;

    const todoTextElement = todoItem.querySelector('.todo-text');
    const originalText = todoTextElement.textContent;
    
    // 입력 필드로 변경
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-text editing';
    input.value = originalText;
    
    // 기존 텍스트 요소 교체
    todoItem.replaceChild(input, todoTextElement);
    input.focus();
    input.select();
    
    // 수정 완료 처리 함수
    const finishEdit = async () => {
        const newText = input.value.trim();
        
        if (newText === '') {
            alert('할일 내용을 비울 수 없습니다!');
            input.focus();
            return;
        }

        try {
            // Realtime Database에서 할일 업데이트
            const todoRef = ref(db, `todos/${id}`);
            await update(todoRef, {
                text: newText
            });
        } catch (error) {
            console.error('할일 수정 중 오류 발생:', error);
            alert('할일 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
            renderTodos();
        }
    };
    
    // 엔터 키로 수정 완료
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            finishEdit();
        }
    });
    
    // 포커스 잃으면 수정 취소 (원래 텍스트로 복원)
    input.addEventListener('blur', () => {
        if (input.value.trim() !== originalText) {
            finishEdit();
        } else {
            renderTodos();
        }
    });
}

// 완료된 항목 모두 삭제
async function clearCompletedTodos() {
    const completedTodos = todos.filter(t => t.completed);
    const completedCount = completedTodos.length;
    
    if (completedCount === 0) {
        alert('완료된 할일이 없습니다!');
        return;
    }

    if (!confirm(`완료된 ${completedCount}개의 할일을 모두 삭제하시겠습니까?`)) {
        return;
    }

    try {
        // 완료된 모든 할일을 Realtime Database에서 삭제
        const deletePromises = completedTodos.map(todo => {
            const todoRef = ref(db, `todos/${todo.id}`);
            return remove(todoRef);
        });
        
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('완료된 항목 삭제 중 오류 발생:', error);
        alert('완료된 항목 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 필터에 따른 할일 목록 필터링
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// 할일 목록 렌더링
function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    // 목록 초기화
    todoList.innerHTML = '';

    // 필터된 할일이 없을 경우
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        
        let message = '';
        if (currentFilter === 'active') {
            message = '진행중인 할일이 없습니다!';
        } else if (currentFilter === 'completed') {
            message = '완료된 할일이 없습니다!';
        } else {
            message = '할일을 추가해보세요!';
        }
        
        emptyMessage.textContent = message;
        todoList.appendChild(emptyMessage);
    } else {
        // 할일 항목 렌더링 (createdAt 기준으로 정렬 - 최신순)
        const sortedTodos = [...filteredTodos].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        sortedTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', todo.id);

            // 체크박스
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => toggleTodo(todo.id));

            // 텍스트
            const text = document.createElement('span');
            text.className = 'todo-text';
            text.textContent = todo.text;

            // 수정 버튼
            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-edit';
            editBtn.textContent = '수정';
            editBtn.addEventListener('click', () => startEditTodo(todo.id));

            // 삭제 버튼
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.textContent = '삭제';
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            // 액션 버튼 그룹
            const actions = document.createElement('div');
            actions.className = 'todo-actions';
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            // 요소들을 리스트 아이템에 추가
            li.appendChild(checkbox);
            li.appendChild(text);
            li.appendChild(actions);

            todoList.appendChild(li);
        });
    }

    // 통계 업데이트
    updateStats();
}

// 통계 정보 업데이트
function updateStats() {
    const total = todos.length;
    const active = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t => t.completed).length;
    
    todoCount.textContent = `전체: ${total}개 | 진행중: ${active}개 | 완료: ${completed}개`;
}

// 필터 버튼 클릭 이벤트
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // 모든 버튼에서 active 클래스 제거
        filterButtons.forEach(b => b.classList.remove('active'));
        
        // 클릭한 버튼에 active 클래스 추가
        btn.classList.add('active');
        
        // 필터 상태 업데이트
        currentFilter = btn.getAttribute('data-filter');
        
        // 목록 다시 렌더링
        renderTodos();
    });
});

// 이벤트 리스너 등록
addBtn.addEventListener('click', addTodo);

// 엔터 키로 할일 추가
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

clearCompleted.addEventListener('click', clearCompletedTodos);

// Realtime Database에서 할일 목록 불러오기 (실시간 업데이트)
function loadTodos() {
    try {
        console.log('📋 할일 목록 불러오기 시작...');
        
        // 실시간 리스너 설정
        onValue(todosRef, (snapshot) => {
            console.log('🔄 실시간 업데이트 수신');
            
            const data = snapshot.val();
            
            if (data) {
                // 데이터를 배열로 변환 (Realtime Database는 객체 형태로 저장됨)
                todos = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                
                console.log(`✅ ${todos.length}개의 할일을 불러왔습니다.`);
            } else {
                todos = [];
                console.log('할일이 없습니다.');
            }
            
            renderTodos();
        }, (error) => {
            console.error('❌ 실시간 업데이트 오류:', error);
            console.error('에러 코드:', error.code);
            console.error('에러 메시지:', error.message);
            
            let errorMessage = '실시간 업데이트 연결에 문제가 발생했습니다.';
            if (error.code === 'PERMISSION_DENIED') {
                errorMessage = '권한이 없습니다. Firebase Realtime Database 보안 규칙을 확인해주세요.';
                alert(errorMessage);
            } else if (error.code === 'UNAVAILABLE') {
                errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
                alert(errorMessage);
            }
            
            // 목록 비우기 표시
            todoList.innerHTML = '<li class="empty-message">할일 목록을 불러올 수 없습니다.</li>';
        });

        console.log('👂 실시간 업데이트 리스너 설정 완료');

    } catch (error) {
        console.error('❌ 할일 목록 불러오기 오류:', error);
        console.error('에러 코드:', error.code);
        console.error('에러 메시지:', error.message);
        
        // 에러 타입에 따른 메시지
        let errorMessage = '할일 목록을 불러오는 중 오류가 발생했습니다.';
        if (error.code === 'PERMISSION_DENIED') {
            errorMessage = '권한이 없습니다. Firebase Realtime Database 보안 규칙을 확인해주세요.';
        } else if (error.code === 'UNAVAILABLE') {
            errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
        }
        
        alert(errorMessage);
        
        // 목록 비우기 표시
        todoList.innerHTML = '<li class="empty-message">할일 목록을 불러올 수 없습니다.</li>';
    }
}

// 페이지 로드 시 Firebase 연결 확인 후 할일 목록 불러오기
window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 앱 시작 중...');
    const isConnected = await checkFirebaseConnection();
    
    if (isConnected) {
        loadTodos();
    } else {
        console.warn('⚠️ Firebase 연결 실패 - 할일 목록을 불러올 수 없습니다.');
        todoList.innerHTML = '<li class="empty-message">Firebase 연결에 실패했습니다.</li>';
    }
});