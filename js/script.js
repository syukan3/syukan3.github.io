document.addEventListener('DOMContentLoaded', function () {
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
                header.style.backgroundColor = 'var(--surface-color)';
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
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
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

    // モバイルデバイスの場合、mobile-block.htmlにリダイレクト
    if (isMobile()) {
        window.location.href = 'mobile-block.html';
    }

    // スポットライト効果の追加
    const spotlight = document.querySelector('.spotlight');
    let time = 0; // グローバルスコープで time を定義

    function animate() {
        if (!spotlight) return; // spotlightが存在しない場合は関数を終了

        time += 0.003; // アニメーション速度
        const x1 = (Math.sin(time) + 1) / 2;
        const y1 = (Math.cos(time * 0.8) + 1) / 2;
        const x2 = (Math.sin(time * 1.2 + 2) + 1) / 2;
        const y2 = (Math.cos(time * 0.9 + 1) + 1) / 2;

        const width = spotlight.offsetWidth;
        const height = spotlight.offsetHeight;

        const spotlight1X = x1 * width;
        const spotlight1Y = y1 * height;
        const spotlight2X = x2 * width;
        const spotlight2Y = y2 * height;

        spotlight.style.background = `
            radial-gradient(
                circle 200px at ${spotlight1X}px ${spotlight1Y}px,
                rgba(255, 255, 255, 0.7),
                transparent 70%
            ),
            radial-gradient(
                circle 200px at ${spotlight2X}px ${spotlight2Y}px,
                rgba(3, 218, 198, 0.7),
                transparent 70%
            )
        `;

        requestAnimationFrame(animate);
    }

    if (spotlight) {
        animate();
    }
});
