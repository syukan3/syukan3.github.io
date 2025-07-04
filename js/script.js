document.addEventListener('DOMContentLoaded', function () {
    // Chart.js のデフォルト設定
    Chart.defaults.color = '#ffffff';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
    Chart.defaults.font.family = "'Inter', sans-serif";



    // ナビゲーションのスムーズスクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // プロジェクトカードのアニメーション
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length > 0) {
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        projectCards.forEach(card => {
            card.style.opacity = 0;
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
    }

    // ヘッダーの透明度変更
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.style.backgroundColor = 'rgba(30, 30, 30, 0.8)';
            } else {
                header.style.backgroundColor = 'var(--glass-bg)';
            }
        });
    }

    // モーダル関連のコード
    const modals = document.querySelectorAll('.modal');
    const modalContents = document.querySelectorAll('.modal-content');

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            document.body.style.overflow = 'hidden';
            
            // Qiitaモーダルの場合、チャートを生成
            if (modalId === 'modal-qiita') {
                setTimeout(() => {
                    initQiitaCharts();
                }, 100);
            }
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Qiitaモーダルの場合、チャートを破棄
                if (modalId === 'modal-qiita') {
                    destroyQiitaCharts();
                }
            }, 300);
        }
    }
    
    // Qiitaチャートの管理
    let qiitaCharts = {};
    
    function initQiitaCharts() {
        // 既存のチャートがあれば破棄
        destroyQiitaCharts();
        
        // ビュー数推移グラフ
        const viewProgressCtx = document.getElementById('qiitaViewProgressChart');
        if (viewProgressCtx) {
            const chartData = {
                labels: ['2024/11/3', '2025/2/14', '2025/3/5', '2025/3/24', '2025/4/11', '2025/4/23', '2025/7/1'],
                actualData: [400131, 602734, 708085, 806290, 907474, 1003277, 1434762]
            };

            qiitaCharts.viewProgress = new Chart(viewProgressCtx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [{
                        label: 'ビュー数',
                        data: chartData.actualData,
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#8B5CF6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1500,
                        easing: 'easeInOutQuart'
                    },
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: '#ffffff',
                                usePointStyle: true,
                                padding: 10
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed.y;
                                    return 'ビュー数: ' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: '#ffffff'
                            }
                        },
                        y: {
                            min: 350000,
                            max: 1500000,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: '#ffffff',
                                callback: function(value) {
                                    return (value / 10000).toFixed(0) + '万';
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // 月間成長率グラフ
        const growthRateCtx = document.getElementById('qiitaGrowthRateChart');
        if (growthRateCtx) {
            const monthlyData = [30000, 45000, 65000, 85000, 95000, 100000];
            const growthRates = monthlyData.map((value, index) => {
                if (index === 0) return 0;
                return ((value - monthlyData[index - 1]) / monthlyData[index - 1] * 100).toFixed(1);
            });

            qiitaCharts.growthRate = new Chart(growthRateCtx, {
                type: 'bar',
                data: {
                    labels: ['開始前', '12月', '1月', '2月', '3月', '4月'],
                    datasets: [{
                        label: '月間ビュー数',
                        data: monthlyData,
                        backgroundColor: function(context) {
                            const value = context.parsed.y;
                            if (value >= 100000) return 'rgba(16, 185, 129, 0.8)';
                            if (value >= 80000) return 'rgba(59, 130, 246, 0.8)';
                            return 'rgba(139, 92, 246, 0.8)';
                        },
                        borderColor: function(context) {
                            const value = context.parsed.y;
                            if (value >= 100000) return '#10B981';
                            if (value >= 80000) return '#3B82F6';
                            return '#8B5CF6';
                        },
                        borderWidth: 2,
                        barPercentage: 0.7
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1500,
                        delay: function(context) {
                            return context.dataIndex * 200;
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    const label = '月間ビュー: ' + context.parsed.y.toLocaleString();
                                    if (context.dataIndex > 0) {
                                        return [label, `成長率: +${growthRates[context.dataIndex]}%`];
                                    }
                                    return label;
                                }
                            }
                        },
                        datalabels: {
                            anchor: 'end',
                            align: 'end',
                            color: '#10B981',
                            font: {
                                weight: 'bold',
                                size: 12
                            },
                            formatter: function(value, context) {
                                if (context.dataIndex > 0) {
                                    return `+${growthRates[context.dataIndex]}%`;
                                }
                                return '';
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#ffffff'
                            }
                        },
                        y: {
                            beginAtZero: true,
                            max: 110000,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: '#ffffff',
                                callback: function(value) {
                                    return (value / 10000).toFixed(0) + '万';
                                }
                            }
                        }
                    }
                }
            });
        }
    }
    
    function destroyQiitaCharts() {
        Object.values(qiitaCharts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        qiitaCharts = {};
    }

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    modalContents.forEach(content => {
        content.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // プロジェクトカードにクリックイベントを追加
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const modalId = card.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    // 閉じるボタンにイベントリスナーを追加
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modalId = closeBtn.closest('.modal').id;
            closeModal(modalId);
        });
    });

    // ブログ投稿のアニメーション
    const blogPosts = document.querySelectorAll('.blog-post');
    const blogObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    blogPosts.forEach(post => {
        post.style.opacity = 0;
        post.style.transform = 'translateY(20px)';
        post.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        blogObserver.observe(post);
    });

    // スキルバーのアニメーション
    const skillBars = document.querySelectorAll('.skill-bar');

    // 初期表示時にスキルバーを0%に設定
    skillBars.forEach(bar => {
        const skillLevel = bar.querySelector('.skill-level');
        const width = skillLevel.style.width; // 元の幅を取得
        skillLevel.setAttribute('data-width', width); // data-width属性に保存
        skillLevel.style.width = '0%'; // 初期幅を0%に設定
    });

    const skillObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillLevel = entry.target.querySelector('.skill-level');
                const width = skillLevel.getAttribute('data-width');
                skillLevel.style.transition = 'width 1s ease-in-out';
                skillLevel.style.width = width; // スキルレベルの幅を更新
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    skillBars.forEach(bar => skillObserver.observe(bar));

    // スクロールアニメーション用の数
    function createScrollAnimation(elements, options = {}) {
        const defaultOptions = {
            threshold: 0.1,
            rootMargin: '0px',
            animationClass: 'fade-in'
        };
        const mergedOptions = { ...defaultOptions, ...options };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(mergedOptions.animationClass);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: mergedOptions.threshold,
            rootMargin: mergedOptions.rootMargin
        });

        elements.forEach(el => {
            el.classList.add('scroll-animation');
            observer.observe(el);
        });
    }

    // 各セクションに対してスクロールアニメーションを適用
    createScrollAnimation(document.querySelectorAll('#about, #experience, #projects, #skills, #blog, #contact'));

    // タイムラインアイテムに対して個別のアニメーションを適用
    createScrollAnimation(document.querySelectorAll('.timeline-item'), {
        threshold: 0.3,
        animationClass: 'slide-in'
    });

    // 追加: timeline-contentにクリックイベントを追加
    const timelineContents = document.querySelectorAll('.timeline-content');
    timelineContents.forEach(content => {
        content.addEventListener('mouseenter', () => {
            content.style.cursor = 'pointer';
        });
        content.addEventListener('mouseleave', () => {
            content.style.cursor = 'default';
        });
        content.addEventListener('click', () => {
            const modalId = content.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        // ポップアップを生成する関数
        function createPopup(type, message) {
            const popup = document.createElement('div');
            popup.className = `popup ${type}`;
            popup.style.position = 'fixed';
            popup.style.top = '20px';
            popup.style.left = '50%';
            popup.style.transform = 'translateX(-50%)';
            popup.style.backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';
            popup.style.color = 'white';
            popup.style.padding = '20px';
            popup.style.borderRadius = '5px';
            popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            popup.style.zIndex = '1000';
            popup.style.display = 'flex';
            popup.style.alignItems = 'flex-start';
            popup.style.maxWidth = '90%';
            popup.style.width = '400px';

            const icon = document.createElement('span');
            icon.innerHTML = type === 'success' ? '✅' : '❌';
            icon.style.marginRight = '15px';
            icon.style.fontSize = '24px';
            icon.style.flexShrink = '0';

            const textContainer = document.createElement('div');
            textContainer.style.flex = '1';

            message.split('\n').forEach(line => {
                const paragraph = document.createElement('p');
                paragraph.textContent = line;
                paragraph.style.margin = '0 0 10px 0';
                textContainer.appendChild(paragraph);
            });

            popup.appendChild(icon);
            popup.appendChild(textContainer);

            document.body.appendChild(popup);

            setTimeout(() => {
                popup.remove();
            }, 5000);
        }

        // reCAPTCHA v3のトークンを取得
        function getRecaptchaTokenAndSubmit() {
            grecaptcha.enterprise.ready(function () {
                grecaptcha.enterprise.execute('6LdTCEUqAAAAAI6AkAc5CuVYcLPqPHlRXz0OG9Xj', { action: 'submit' })
                    .then(function (token) {
                        // フォームデータを取得
                        const formData = new FormData(contactForm);
                        formData.append('recaptcha_response', token);

                        fetch('https://5kpdn47l2j4ovl3fuiuro2wf3q0oixif.lambda-url.ap-northeast-1.on.aws/', {
                            method: 'POST',
                            body: formData
                        })
                            .then(response => {
                                console.log('サーバーからのレスポンス:', response);
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('reCAPTCHAとフォームデータが送信されました:', data);
                                contactForm.reset();
                                createPopup('success', 'メッセージが正常に送信されました。\n確認次第、返信いたします。');
                                // 送信ボタンを有効化し、元の状態に戻す
                                const submitButton = contactForm.querySelector('button[type="submit"]');
                                submitButton.disabled = false;
                                submitButton.innerHTML = '送信';
                                submitButton.style.backgroundColor = ''; // ボタンの色を元に戻す
                            })
                            .catch(error => {
                                console.error('送信中にエラーが発生しました:', error);
                                createPopup('error', 'メッセージの送信中にエラーが発生しました。\nもう一度お試しください。');
                                // 送信ボタンを有効化し、元の状態に戻す
                                const submitButton = contactForm.querySelector('button[type="submit"]');
                                submitButton.disabled = false;
                                submitButton.innerHTML = '送信';
                                submitButton.style.backgroundColor = ''; // ボタンの色を元に戻す
                            });
                    });
            });
        }

        // フォーム送信時に検証を実行
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            // 送信ボタンを無効化し、ローディング状態にする
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; // くるくる回るアイコンを追加
            submitButton.style.backgroundColor = 'gray'; // ボタンの色をグレーにする

            getRecaptchaTokenAndSubmit();
        });
    } else {
        console.log("Contact form not found on this page.");
    }

    // スマートフォン検出とモーダル表示
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // モバイルデバイスのサポート - リダイレクトを削除
    // if (isMobile()) {
    //     window.location.href = 'mobile-block.html';
    // }

    // パーティクルシステムの作成
    const particlesContainer = document.querySelector('.particles-container');
    
    function createParticle() {
        if (!particlesContainer) return;
        
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // ランダムなサイズ
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // ランダムな位置
        particle.style.left = Math.random() * 100 + '%';
        
        // ランダムな遅延
        particle.style.animationDelay = Math.random() * 8 + 's';
        
        // ランダムな持続時間
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        
        particlesContainer.appendChild(particle);
        
        // アニメーション終了後に削除
        setTimeout(() => {
            particle.remove();
        }, 8000);
    }
    
    // 定期的にパーティクルを生成
    if (particlesContainer) {
        setInterval(createParticle, 300);
    }
    
    // グローオーブの作成
    const glowOrbs = document.querySelector('.glow-orbs');
    if (glowOrbs) {
        for (let i = 0; i < 3; i++) {
            const orb = document.createElement('div');
            orb.className = 'orb';
            glowOrbs.appendChild(orb);
        }
    }
    
    // ウェーブキャンバスアニメーション
    const waveCanvas = document.querySelector('.wave-canvas');
    if (waveCanvas) {
        const ctx = waveCanvas.getContext('2d');
        let waveTime = 0;
        
        function resizeCanvas() {
            waveCanvas.width = waveCanvas.offsetWidth;
            waveCanvas.height = waveCanvas.offsetHeight;
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        function drawWave() {
            ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
            
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
            ctx.lineWidth = 2;
            
            for (let x = 0; x < waveCanvas.width; x++) {
                const y = waveCanvas.height / 2 + 
                         Math.sin((x + waveTime) * 0.01) * 30 + 
                         Math.sin((x + waveTime * 1.5) * 0.005) * 20;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
            
            for (let x = 0; x < waveCanvas.width; x++) {
                const y = waveCanvas.height / 2 + 
                         Math.sin((x + waveTime * 0.8) * 0.01) * 25 + 
                         Math.sin((x + waveTime * 1.2) * 0.007) * 15;
                
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            waveTime += 2;
            requestAnimationFrame(drawWave);
        }
        
        drawWave();
    }
    
    // グリッチエフェクトのランダム化
    const glitchElement = document.querySelector('.glitch');
    if (glitchElement) {
        setInterval(() => {
            glitchElement.style.animation = 'none';
            setTimeout(() => {
                glitchElement.style.animation = '';
            }, 100);
        }, 3000);
    }

    // フォントの読み込みを確認
    if (document.fonts) {
        document.fonts.ready.then(function () {
            console.log('All fonts are loaded and ready');
            document.body.classList.add('fonts-loaded'); 
        });
    }
});
