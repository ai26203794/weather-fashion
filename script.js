/**
 * Weather Fashion - 天気に基づくファッション提案システム
 * 
 * 機能:
 * - 位置情報から天気を取得
 * - 季節と天気に基づいたファッション画像の表示
 * - 音声再生機能
 * - ライト/ダークテーマ切り替え
 */

// ===================================
// テーマ設定（ナイトモード）
// ===================================

/**
 * テーマを初期化
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

/**
 * テーマを切り替え
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ページ読み込み時にテーマを適用
initTheme();

// テーマ切り替えボタンのイベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

// ===================================
// 設定
// ===================================

// OpenWeatherMap API キー（無料登録: https://openweathermap.org/api）
// TODO: 実際のAPIキーに置き換えてください
const API_KEY = 'YOUR_API_KEY_HERE';

// 季節の定義（月ベース）
const SEASONS = {
    spring: [3, 4, 5],    // 3月〜5月
    summer: [6, 7, 8],    // 6月〜8月
    autumn: [9, 10, 11],  // 9月〜11月
    winter: [12, 1, 2]    // 12月〜2月
};

// 季節の日本語名
const SEASON_NAMES = {
    spring: '春',
    summer: '夏',
    autumn: '秋',
    winter: '冬'
};

// 天気コードとカテゴリのマッピング
const WEATHER_CATEGORIES = {
    sunny: {
        codes: [800],  // Clear
        icon: '☀️',
        name: '晴れ'
    },
    cloudy: {
        codes: [801, 802, 803, 804],  // Clouds
        icon: '☁️',
        name: '曇り'
    },
    rainy: {
        codes: [300, 301, 302, 310, 311, 312, 313, 314, 321, 500, 501, 502, 503, 504, 511, 520, 521, 522, 531],
        icon: '🌧️',
        name: '雨'
    },
    snowy: {
        codes: [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622],
        icon: '❄️',
        name: '雪'
    }
};

// ファッションアドバイスのテキスト
const FASHION_ADVICE = {
    spring: {
        sunny: {
            title: '春の晴れコーデ',
            advice: '春らしい爽やかな天気です！軽やかなトレンチコートや薄手のカーディガンがおすすめ。パステルカラーで季節感を演出しましょう。'
        },
        cloudy: {
            title: '春の曇りコーデ',
            advice: '少し肌寒い曇り空です。薄手のジャケットやカーディガンを羽織って、体温調節しやすいレイヤードスタイルがおすすめです。'
        },
        rainy: {
            title: '春の雨コーデ',
            advice: '雨の日はレインコートやウォータープルーフのジャケットを。足元は防水シューズで濡れ対策を忘れずに。'
        },
        snowy: {
            title: '春の雪コーデ',
            advice: '珍しい春の雪です！暖かいコートとブーツで防寒対策を。滑りにくい靴底の靴を選びましょう。'
        }
    },
    summer: {
        sunny: {
            title: '夏の晴れコーデ',
            advice: '暑い夏日です！通気性の良い素材のTシャツやワンピースがおすすめ。日焼け対策に帽子やサングラスも忘れずに。'
        },
        cloudy: {
            title: '夏の曇りコーデ',
            advice: '曇りでも蒸し暑い日。涼しげなリネン素材やコットンの服装で快適に過ごしましょう。'
        },
        rainy: {
            title: '夏の雨コーデ',
            advice: '梅雨や夏の急な雨に備えて、折りたたみ傘を持ち歩きましょう。速乾性のある素材がおすすめです。'
        },
        snowy: {
            title: '夏の雪コーデ',
            advice: '非常に珍しい天候です。念のため上着を持って外出しましょう。'
        }
    },
    autumn: {
        sunny: {
            title: '秋の晴れコーデ',
            advice: '過ごしやすい秋晴れです！軽いジャケットやニットカーディガンで季節感を。ブラウンやボルドーなど秋色がおすすめ。'
        },
        cloudy: {
            title: '秋の曇りコーデ',
            advice: '肌寒くなりそうな曇り空。重ね着で体温調節できるスタイルを。ストールやマフラーをプラスしても◎'
        },
        rainy: {
            title: '秋の雨コーデ',
            advice: '秋雨の季節。撥水加工のトレンチコートやブーツがおすすめ。折りたたみ傘もお忘れなく。'
        },
        snowy: {
            title: '秋の雪コーデ',
            advice: '早い冬の訪れです。暖かいコートとマフラーで防寒対策を。足元は滑りにくいブーツがおすすめ。'
        }
    },
    winter: {
        sunny: {
            title: '冬の晴れコーデ',
            advice: '晴れていても寒い冬。暖かいダウンジャケットやウールコートで防寒を。マフラーと手袋で完璧に。'
        },
        cloudy: {
            title: '冬の曇りコーデ',
            advice: '底冷えする曇りの日。ヒートテックなどのインナーでしっかり防寒。ニット帽やイヤーマフもおすすめです。'
        },
        rainy: {
            title: '冬の雨コーデ',
            advice: '冷たい雨の日。防水性のあるコートと暖かいブーツで。濡れても乾きやすい素材を選びましょう。'
        },
        snowy: {
            title: '冬の雪コーデ',
            advice: '本格的な雪の日。ダウンコートやムートンブーツでしっかり防寒。滑りにくい靴底と防水対策が必須です。'
        }
    }
};

// ===================================
// DOM要素の取得
// ===================================

const getWeatherBtn = document.getElementById('getWeatherBtn');
const weatherDisplay = document.getElementById('weatherDisplay');
const fashionSuggestion = document.getElementById('fashionSuggestion');
const selectorSection = document.getElementById('selectorSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');

// 天気情報表示要素
const weatherIcon = document.getElementById('weatherIcon');
const weatherCondition = document.getElementById('weatherCondition');
const locationName = document.getElementById('locationName');
const temperature = document.getElementById('temperature');
const seasonText = document.getElementById('seasonText');

// ファッション表示要素
const fashionImage = document.getElementById('fashionImage');
const imagePlaceholder = document.getElementById('imagePlaceholder');
const fashionTitle = document.getElementById('fashionTitle');
const fashionAdvice = document.getElementById('fashionAdvice');
const playVoiceBtn = document.getElementById('playVoiceBtn');
const fashionAudio = document.getElementById('fashionAudio');

// セレクター要素
const seasonSelector = document.getElementById('seasonSelector');
const weatherSelector = document.getElementById('weatherSelector');

// 現在の選択状態
let currentSeason = null;
let currentWeather = null;

// ===================================
// イベントリスナー
// ===================================

getWeatherBtn.addEventListener('click', handleGetWeather);
playVoiceBtn.addEventListener('click', handlePlayVoice);

// 季節セレクターのイベントリスナー
seasonSelector.querySelectorAll('.selector-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // アクティブ状態を更新
        seasonSelector.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentSeason = btn.dataset.value;
        updateDisplayFromSelector();
    });
});

// 天気セレクターのイベントリスナー
weatherSelector.querySelectorAll('.selector-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // アクティブ状態を更新
        weatherSelector.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentWeather = btn.dataset.value;
        updateDisplayFromSelector();
    });
});

/**
 * セレクターからの選択を反映
 */
function updateDisplayFromSelector() {
    if (!currentSeason || !currentWeather) return;
    
    // 天気表示を更新
    const categoryData = WEATHER_CATEGORIES[currentWeather];
    weatherIcon.textContent = categoryData.icon;
    weatherCondition.textContent = categoryData.name;
    locationName.textContent = '手動選択';
    temperature.textContent = '--°C';
    seasonText.textContent = SEASON_NAMES[currentSeason];
    
    // ファッション提案を更新
    updateFashionSuggestion(currentSeason, currentWeather);
    
    // セクションを表示
    weatherDisplay.style.display = 'block';
    fashionSuggestion.style.display = 'block';
}

/**
 * セレクターのアクティブ状態を設定
 */
function setActiveSelector(season, weather) {
    // 季節ボタンのアクティブ状態を設定
    seasonSelector.querySelectorAll('.selector-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === season);
    });
    
    // 天気ボタンのアクティブ状態を設定
    weatherSelector.querySelectorAll('.selector-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === weather);
    });
    
    currentSeason = season;
    currentWeather = weather;
}

// ===================================
// メイン関数
// ===================================

/**
 * 天気取得ボタンのクリックハンドラ
 */
async function handleGetWeather() {
    showLoading(true);
    
    try {
        // 位置情報を取得
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // 天気情報を取得
        const weatherData = await fetchWeatherData(latitude, longitude);
        
        // 季節を判定
        const season = getCurrentSeason();
        
        // 天気カテゴリを判定
        const weatherCategory = getWeatherCategory(weatherData.weather[0].id);
        
        // 画面を更新
        updateWeatherDisplay(weatherData, season, weatherCategory);
        updateFashionSuggestion(season, weatherCategory);
        
        // セレクターのアクティブ状態を設定
        setActiveSelector(season, weatherCategory);
        
        // セクションを表示
        weatherDisplay.style.display = 'block';
        selectorSection.style.display = 'block';
        fashionSuggestion.style.display = 'block';
        
        // スムーズにスクロール
        weatherDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * 音声再生ボタンのクリックハンドラ
 */
function handlePlayVoice() {
    const audioSrc = fashionAudio.src;
    
    if (!audioSrc || audioSrc === window.location.href) {
        // 音声ファイルがない場合はWeb Speech APIを使用
        const text = fashionAdvice.textContent;
        speakText(text);
    } else {
        // 音声ファイルがある場合は再生
        fashionAudio.currentTime = 0;
        fashionAudio.play().catch(error => {
            console.warn('Audio playback failed, using speech synthesis:', error);
            speakText(fashionAdvice.textContent);
        });
    }
}

// ===================================
// API関連
// ===================================

/**
 * 現在位置を取得
 */
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('お使いのブラウザは位置情報に対応していません'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            resolve,
            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject(new Error('位置情報の使用が許可されていません'));
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error('位置情報を取得できませんでした'));
                        break;
                    case error.TIMEOUT:
                        reject(new Error('位置情報の取得がタイムアウトしました'));
                        break;
                    default:
                        reject(new Error('位置情報の取得に失敗しました'));
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    });
}

/**
 * OpenWeatherMap APIから天気情報を取得
 */
async function fetchWeatherData(lat, lon) {
    // APIキーが設定されていない場合はデモデータを返す
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('API key not set. Using demo data.');
        return getDemoWeatherData();
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('天気情報の取得に失敗しました');
    }
    
    return response.json();
}

/**
 * デモ用の天気データ
 */
function getDemoWeatherData() {
    const demoConditions = [
        { id: 800, main: 'Clear', description: '晴天' },
        { id: 801, main: 'Clouds', description: '曇り' },
        { id: 500, main: 'Rain', description: '小雨' },
        { id: 600, main: 'Snow', description: '雪' }
    ];
    
    // ランダムに天気を選択
    const randomCondition = demoConditions[Math.floor(Math.random() * demoConditions.length)];
    
    return {
        name: 'デモ地点',
        main: {
            temp: Math.floor(Math.random() * 25) + 5
        },
        weather: [randomCondition]
    };
}

// ===================================
// 季節・天気判定
// ===================================

/**
 * 現在の季節を取得
 */
function getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12
    
    for (const [season, months] of Object.entries(SEASONS)) {
        if (months.includes(month)) {
            return season;
        }
    }
    
    return 'spring'; // デフォルト
}

/**
 * 天気コードからカテゴリを取得
 */
function getWeatherCategory(weatherCode) {
    for (const [category, data] of Object.entries(WEATHER_CATEGORIES)) {
        if (data.codes.includes(weatherCode)) {
            return category;
        }
    }
    
    // 不明な天気コードは曇りとして扱う
    return 'cloudy';
}

// ===================================
// 画面更新
// ===================================

/**
 * 天気表示を更新
 */
function updateWeatherDisplay(weatherData, season, weatherCategory) {
    const categoryData = WEATHER_CATEGORIES[weatherCategory];
    
    weatherIcon.textContent = categoryData.icon;
    weatherCondition.textContent = categoryData.name;
    locationName.textContent = weatherData.name;
    temperature.textContent = `${Math.round(weatherData.main.temp)}°C`;
    seasonText.textContent = SEASON_NAMES[season];
}

/**
 * ファッション提案を更新
 */
function updateFashionSuggestion(season, weatherCategory) {
    const advice = FASHION_ADVICE[season][weatherCategory];
    const imageFileName = `${season}-${weatherCategory}.png`;
    const audioFileName = `${season}-${weatherCategory}.wav`;
    
    // タイトルとアドバイスを更新
    fashionTitle.textContent = advice.title;
    fashionAdvice.textContent = advice.advice;
    
    // 画像を更新
    fashionImage.src = `images/${imageFileName}`;
    fashionImage.alt = advice.title;
    
    // 画像の読み込み状態を管理
    imagePlaceholder.style.display = 'flex';
    fashionImage.style.display = 'none';
    
    fashionImage.onload = () => {
        imagePlaceholder.style.display = 'none';
        fashionImage.style.display = 'block';
    };
    
    fashionImage.onerror = () => {
        // 画像がない場合はプレースホルダーを表示し続ける
        imagePlaceholder.querySelector('p').textContent = '画像が見つかりません';
    };
    
    // 音声ファイルを設定
    fashionAudio.src = `audio/${audioFileName}`;
}

// ===================================
// 音声合成（Web Speech API）
// ===================================

/**
 * テキストを音声で読み上げ
 */
function speakText(text) {
    if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        return;
    }
    
    // 現在の発話を停止
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // 日本語の音声を探す
    const voices = speechSynthesis.getVoices();
    const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
    if (japaneseVoice) {
        utterance.voice = japaneseVoice;
    }
    
    speechSynthesis.speak(utterance);
}

// 音声リストが読み込まれた時に更新
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
        // 音声リストが更新された
    };
}

// ===================================
// UI ヘルパー
// ===================================

/**
 * ローディング表示の切り替え
 */
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

/**
 * エラーモーダルを表示
 */
function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'flex';
}

/**
 * エラーモーダルを閉じる
 */
function closeErrorModal() {
    errorModal.style.display = 'none';
}

// グローバルに公開（HTMLから呼び出すため）
window.closeErrorModal = closeErrorModal;

