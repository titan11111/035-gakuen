// ゲーム状態管理
class GameState {
    constructor() {
        this.currentScene = 'start';
        this.bgmVolume = 0.7;
        this.seVolume = 0.8;
        this.textSpeed = 5;
        this.isTyping = false;
        this.isAutoMode = false;
        this.readScenes = new Set();
        this.gameFlags = {};
    }
}

// グローバル変数
let gameState = new GameState();
let currentScenario = {};
let typeInterval = null;
let autoInterval = null;

// シナリオデータ（通常は外部JSONファイルですが、今回は埋め込み）
const scenario = {
    "start": {
        "text": "放課後の教室。夕日が窓から差し込んで、机や椅子に長い影を作っている。\n\n（今日も一人か...）\n\n机の引き出しを整理していると、奥から古いカセットテープが出てきた。ラベルには「楓へ」と書かれている。\n\n（これ、私の名前...でも誰が？）",
        "bg": "./assets/images/bg_classroom.jpg",
        "bgm": "./assets/audio/bgm_intro.mp3",
        "se": null,
        "choices": {
            "カセットを再生してみる": "scene1",
            "気味が悪いので捨てる": "scene_bad1"
        }
    },
    "scene1": {
        "text": "古いラジカセにカセットを入れて再生ボタンを押す。\n\n『...楓ちゃん、聞こえる？』\n\n知らない女の子の声。でも、なぜか懐かしい感じがする。\n\n『私はユリ。覚えてない？小学校の時の...』\n\n（ユリ...？小学校の時の記憶が曖昧で...）",
        "bg": "./assets/images/bg_classroom.jpg",
        "bgm": "./assets/audio/bgm_mystery.mp3",
        "se": "./assets/audio/se_tape_insert.mp3",
        "speaker": "謎の声",
        "choices": {
            "もっと聞いてみる": "scene2",
            "怖くなって止める": "scene_bad2"
        }
    },
    "scene2": {
        "text": "『あの頃、私たちはいつも一緒だった。図書室で本を読んだり、屋上で空を見上げたり...』\n\n少しずつ記憶の欠片が戻ってくる。小学校5年生の時、確かに仲良しの女の子がいた。\n\n（そうだ...ユリちゃん。転校していったんだ）\n\n『でも楓ちゃん、私はもういない。だから、この声だけが私の全て...』",
        "bg": "./assets/images/bg_library.jpg",
        "bgm": "./assets/audio/bgm_memory.mp3",
        "se": null,
        "speaker": "ユリ",
        "choices": {
            "「ユリちゃん、どこにいるの？」": "scene3_true",
            "「これは夢なの？」": "scene3_mystery"
        }
    },
    "scene3_true": {
        "text": "『楓ちゃん...私のこと、本当に覚えてくれてるんだね』\n\nユリの声が嬉しそうに響く。\n\n『実は私、あの時の事故で...でも、楓ちゃんと過ごした思い出だけは消えなくて』\n\n（事故...？そうだ、ユリちゃんは転校じゃなくて...）\n\n記憶の奥から、悲しい真実が浮かび上がってくる。",
        "bg": "./assets/images/bg_memory.jpg",
        "bgm": "./assets/audio/bgm_sad.mp3",
        "se": null,
        "speaker": "ユリ",
        "choices": {
            "「一緒にいよう」": "ending_true",
            "「さよならを言おう」": "ending_bittersweet"
        }
    },
    "scene3_mystery": {
        "text": "『夢かもしれない。現実かもしれない。でも、この気持ちは本物よ』\n\n教室が薄暗くなり、不思議な光が漂い始める。\n\n『楓ちゃん、信じて。私たちの友情を』\n\n（何か大切なことを忘れているような...）",
        "bg": "./assets/images/bg_mystery.jpg",
        "bgm": "./assets/audio/bgm_mysterious.mp3",
        "se": "./assets/audio/se_mystery.mp3",
        "speaker": "ユリ",
        "choices": {
            "信じる": "scene4_trust",
            "疑う": "scene4_doubt"
        }
    },
    "ending_true": {
        "text": "『ありがとう、楓ちゃん。ずっと一人だったけど、やっと安らげる』\n\nユリの声が暖かく響き、教室が優しい光に包まれる。\n\n『今度は、ちゃんとお別れを言えるね』\n\n私は涙を流しながら、小さく頷いた。親友との、本当のお別れ。\n\n--- True End: 友情の絆 ---",
        "bg": "./assets/images/bg_sunset.jpg",
        "bgm": "./assets/audio/bgm_ending_true.mp3",
        "se": null,
        "speaker": "ユリ",
        "choices": {}
    },
    "ending_bittersweet": {
        "text": "『そう...お別れの時なのね』\n\nユリの声に寂しさが滲む。\n\n『でも楓ちゃん、私たちの思い出は永遠よ。大人になっても、忘れないで』\n\n夕日が教室を染める中、カセットの音が静かに止まった。\n\n机の上には、一枚の古い写真。笑顔の私とユリちゃんが写っている。\n\n--- Bittersweet End: 思い出の中で ---",
        "bg": "./assets/images/bg_sunset.jpg",
        "bgm": "./assets/audio/bgm_ending_bitter.mp3",
        "se": "./assets/audio/se_tape_stop.mp3",
        "speaker": null,
        "choices": {}
    },
    "scene_bad1": {
        "text": "カセットを捨てて家に帰った。\n\nでも夜、夢の中で女の子の泣き声が聞こえ続けた。\n\n『楓ちゃん...どうして...』\n\n朝起きると、枕が涙で濡れていた。\n\n大切な何かを失ってしまったような、そんな気持ちだった。\n\n--- Bad End: 失われた記憶 ---",
        "bg": "./assets/images/bg_night.jpg",
        "bgm": "./assets/audio/bgm_bad.mp3",
        "se": null,
        "speaker": null,
        "choices": {}
    },
    "scene_bad2": {
        "text": "怖くなってカセットを止めた。\n\n教室に静寂が戻る。でも心の奥で、誰かが泣いているような気がした。\n\n（気のせい...よね？）\n\nそれからしばらく、時々聞こえる小さな声に悩まされることになった。\n\n--- Bad End: 届かなかった声 ---",
        "bg": "./assets/images/bg_classroom.jpg",
        "bgm": "./assets/audio/bgm_sad.mp3",
        "se": null,
        "speaker": null,
        "choices": {}
    }
};

// DOM要素の取得
const elements = {
    titleScreen: null,
    gameScreen: null,
    configScreen: null,
    menuScreen: null,
    background: null,
    nameBox: null,
    gameText: null,
    nextIndicator: null,
    choicesContainer: null,
    bgmPlayer: null,
    sePlayer: null
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    loadSettings();
    showScreen('titleScreen');
});

// DOM要素を取得
function initializeElements() {
    elements.titleScreen = document.getElementById('titleScreen');
    elements.gameScreen = document.getElementById('gameScreen');
    elements.configScreen = document.getElementById('configScreen');
    elements.menuScreen = document.getElementById('menuScreen');
    elements.background = document.getElementById('background');
    elements.nameBox = document.getElementById('nameBox');
    elements.gameText = document.getElementById('gameText');
    elements.nextIndicator = document.getElementById('nextIndicator');
    elements.choicesContainer = document.getElementById('choicesContainer');
    elements.bgmPlayer = document.getElementById('bgmPlayer');
    elements.sePlayer = document.getElementById('sePlayer');
}

// イベントリスナーの設定
function setupEventListeners() {
    // タイトル画面
    document.getElementById('startBtn').addEventListener('click', () => startNewGame());
    document.getElementById('loadBtn').addEventListener('click', () => loadGame());
    document.getElementById('configBtn').addEventListener('click', () => showScreen('configScreen'));

    // ゲーム画面
    document.getElementById('menuBtn').addEventListener('click', () => showScreen('menuScreen'));
    document.getElementById('autoBtn').addEventListener('click', () => toggleAuto());
    document.getElementById('skipBtn').addEventListener('click', () => toggleSkip());
    document.getElementById('saveBtn').addEventListener('click', () => saveGame());

    // テキストボックスクリック
    document.getElementById('textBox').addEventListener('click', () => nextText());

    // 設定画面
    document.getElementById('configBackBtn').addEventListener('click', () => showScreen('titleScreen'));
    
    // 音量設定
    document.getElementById('bgmVolume').addEventListener('input', updateBgmVolume);
    document.getElementById('seVolume').addEventListener('input', updateSeVolume);
    document.getElementById('textSpeed').addEventListener('input', updateTextSpeed);

    // メニュー画面
    document.getElementById('resumeBtn').addEventListener('click', () => showScreen('gameScreen'));
    document.getElementById('saveGameBtn').addEventListener('click', () => saveGame());
    document.getElementById('loadGameBtn').addEventListener('click', () => loadGame());
    document.getElementById('configFromMenuBtn').addEventListener('click', () => showScreen('configScreen'));
    document.getElementById('titleFromMenuBtn').addEventListener('click', () => {
        if(confirm('タイトルに戻りますか？')) showScreen('titleScreen');
    });

    // キーボード操作
    document.addEventListener('keydown', handleKeyboard);
}

// 画面切り替え
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName).classList.add('active');
}

// 新しいゲームを開始
function startNewGame() {
    gameState = new GameState();
    showScreen('gameScreen');
    loadScene('start');
}

// シーンをロード
function loadScene(sceneId) {
    if (!scenario[sceneId]) return;
    
    gameState.currentScene = sceneId;
    gameState.readScenes.add(sceneId);
    currentScenario = scenario[sceneId];
    
    // 背景変更
    if (currentScenario.bg) {
        changeBackground(currentScenario.bg);
    }
    
    // BGM変更
    if (currentScenario.bgm) {
        playBgm(currentScenario.bgm);
    }
    
    // 効果音再生
    if (currentScenario.se) {
        playSe(currentScenario.se);
    }
    
    // 話者名表示
    if (currentScenario.speaker) {
        elements.nameBox.textContent = currentScenario.speaker;
        elements.nameBox.style.display = 'block';
    } else {
        elements.nameBox.style.display = 'none';
    }
    
    // テキスト表示
    typeText(currentScenario.text, () => {
        showChoices();
    });
}

// 背景変更
function changeBackground(imagePath) {
    elements.background.classList.add('fade-out');
    setTimeout(() => {
        elements.background.src = imagePath;
        elements.background.classList.remove('fade-out');
        elements.background.classList.add('fade-in');
    }, 500);
}

// BGM再生
function playBgm(audioPath) {
    if (elements.bgmPlayer.src !== audioPath) {
        elements.bgmPlayer.src = audioPath;
        elements.bgmPlayer.volume = gameState.bgmVolume;
        elements.bgmPlayer.play().catch(e => console.log('BGM再生エラー:', e));
    }
}

// 効果音再生
function playSe(audioPath) {
    elements.sePlayer.src = audioPath;
    elements.sePlayer.volume = gameState.seVolume;
    elements.sePlayer.play().catch(e => console.log('SE再生エラー:', e));
}

// テキストをタイピング風に表示
function typeText(text, callback) {
    if (gameState.isTyping) return;
    
    gameState.isTyping = true;
    elements.gameText.textContent = '';
    elements.nextIndicator.style.display = 'none';
    
    let index = 0;
    const speed = 100 - (gameState.textSpeed * 10);
    
    typeInterval = setInterval(() => {
        if (index < text.length) {
            elements.gameText.textContent += text[index];
            index++;
        } else {
            clearInterval(typeInterval);
            gameState.isTyping = false;
            elements.nextIndicator.style.display = 'block';
            if (callback) callback();
        }
    }, speed);
}

// 次のテキストへ
function nextText() {
    if (gameState.isTyping) {
        // タイピング中なら一気に表示
        clearInterval(typeInterval);
        elements.gameText.textContent = currentScenario.text;
        gameState.isTyping = false;
        elements.nextIndicator.style.display = 'block';
        showChoices();
    }
}

// 選択肢を表示
function showChoices() {
    elements.choicesContainer.innerHTML = '';
    
    if (currentScenario.choices && Object.keys(currentScenario.choices).length > 0) {
        Object.entries(currentScenario.choices).forEach(([choiceText, nextScene]) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choiceText;
            button.addEventListener('click', () => selectChoice(nextScene));
            elements.choicesContainer.appendChild(button);
        });
    } else {
        // エンディングの場合
        setTimeout(() => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = 'タイトルに戻る';
            button.addEventListener('click', () => showScreen('titleScreen'));
            elements.choicesContainer.appendChild(button);
        }, 2000);
    }
}

// 選択肢を選択
function selectChoice(nextScene) {
    elements.choicesContainer.innerHTML = '';
    playSe('./assets/audio/se_select.mp3');
    setTimeout(() => {
        loadScene(nextScene);
    }, 500);
}

// オートモード切り替え
function toggleAuto() {
    gameState.isAutoMode = !gameState.isAutoMode;
    const btn = document.getElementById('autoBtn');
    
    if (gameState.isAutoMode) {
        btn.style.backgroundColor = 'rgba(135, 206, 235, 0.5)';
        btn.textContent = 'オート中';
        startAutoMode();
    } else {
        btn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        btn.textContent = 'オート';
        stopAutoMode();
    }
}

// オートモード開始
function startAutoMode() {
    if (!gameState.isAutoMode) return;
    
    autoInterval = setInterval(() => {
        if (!gameState.isTyping && Object.keys(currentScenario.choices || {}).length === 0) {
            nextText();
        }
    }, 3000);
}

// オートモード停止
function stopAutoMode() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
}

// スキップ機能
function toggleSkip() {
    if (gameState.readScenes.has(gameState.currentScene)) {
        // 既読シーンなら高速表示
        gameState.textSpeed = 10;
        setTimeout(() => {
            gameState.textSpeed = 5;
        }, 1000);
    }
}

// セーブ機能
function saveGame() {
    const saveData = {
        currentScene: gameState.currentScene,
        readScenes: Array.from(gameState.readScenes),
        gameFlags: gameState.gameFlags,
        timestamp: new Date().getTime()
    };
    
    localStorage.setItem('soundnovel_save', JSON.stringify(saveData));
    alert('セーブしました！');
}

// ロード機能
function loadGame() {
    const saveData = localStorage.getItem('soundnovel_save');
    
    if (saveData) {
        const data = JSON.parse(saveData);
        gameState.currentScene = data.currentScene;
        gameState.readScenes = new Set(data.readScenes);
        gameState.gameFlags = data.gameFlags || {};
        
        showScreen('gameScreen');
        loadScene(gameState.currentScene);
        alert('ロードしました！');
    } else {
        alert('セーブデータがありません。');
    }
}

// 設定の保存
function saveSettings() {
    const settings = {
        bgmVolume: gameState.bgmVolume,
        seVolume: gameState.seVolume,
        textSpeed: gameState.textSpeed
    };
    localStorage.setItem('soundnovel_settings', JSON.stringify(settings));
}

// 設定の読み込み
function loadSettings() {
    const settings = localStorage.getItem('soundnovel_settings');
    
    if (settings) {
        const data = JSON.parse(settings);
        gameState.bgmVolume = data.bgmVolume || 0.7;
        gameState.seVolume = data.seVolume || 0.8;
        gameState.textSpeed = data.textSpeed || 5;
        
        // UI反映
        document.getElementById('bgmVolume').value = gameState.bgmVolume * 100;
        document.getElementById('seVolume').value = gameState.seVolume * 100;
        document.getElementById('textSpeed').value = gameState.textSpeed;
        document.getElementById('bgmVolumeValue').textContent = Math.round(gameState.bgmVolume * 100);
        document.getElementById('seVolumeValue').textContent = Math.round(gameState.seVolume * 100);
        document.getElementById('textSpeedValue').textContent = gameState.textSpeed;
    }
}

// 音量設定更新
function updateBgmVolume(e) {
    gameState.bgmVolume = e.target.value / 100;
    elements.bgmPlayer.volume = gameState.bgmVolume;
    document.getElementById('bgmVolumeValue').textContent = e.target.value;
    saveSettings();
}

function updateSeVolume(e) {
    gameState.seVolume = e.target.value / 100;
    elements.sePlayer.volume = gameState.seVolume;
    document.getElementById('seVolumeValue').textContent = e.target.value;
    saveSettings();
}

function updateTextSpeed(e) {
    gameState.textSpeed = parseInt(e.target.value);
    document.getElementById('textSpeedValue').textContent = e.target.value;
    saveSettings();
}

// キーボード操作
function handleKeyboard(e) {
    switch(e.key) {
        case 'Enter':
        case ' ':
            nextText();
            break;
        case 'Escape':
            if (document.getElementById('gameScreen').classList.contains('active')) {
                showScreen('menuScreen');
            }
            break;
        case 's':
        case 'S':
            if (e.ctrlKey) {
                e.preventDefault();
                saveGame();
            }
            break;
        case 'l':
        case 'L':
            if (e.ctrlKey) {
                e.preventDefault();
                loadGame();
            }
            break;
    }
}

// タッチ操作対応
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // 上スワイプ：メニュー表示
            if (document.getElementById('gameScreen').classList.contains('active')) {
                showScreen('menuScreen');
            }
        } else {
            // 下スワイプ：テキスト進行
            nextText();
        }
    }
}

// エラーハンドリング
window.addEventListener('error', function(e) {
    console.error('エラーが発生しました:', e.error);
});

// 音声ファイルが見つからない場合の代替処理
function handleAudioError(audioElement, audioType) {
    audioElement.addEventListener('error', function() {
        console.warn(`${audioType}ファイルが見つかりません: ${audioElement.src}`);
    });
}

// 音声要素にエラーハンドリングを追加
document.addEventListener('DOMContentLoaded', function() {
    handleAudioError(elements.bgmPlayer, 'BGM');
    handleAudioError(elements.sePlayer, '効果音');
});

// 画像の遅延読み込み対応
function preloadImages() {
    const imageUrls = [
        './assets/images/bg_classroom.jpg',
        './assets/images/bg_library.jpg',
        './assets/images/bg_memory.jpg',
        './assets/images/bg_mystery.jpg',
        './assets/images/bg_sunset.jpg',
        './assets/images/bg_night.jpg'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// ゲーム開始時に画像を事前読み込み
document.addEventListener('DOMContentLoaded', function() {
    preloadImages();
});