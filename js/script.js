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

    // ヘッダーの透明度変更
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'rgba(30, 30, 30, 0.8)';
        } else {
            header.style.backgroundColor = 'var(--surface-color)';
        }
    });

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
    if (contactForm) { // フォーム要素が存在するかどうかを確認
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // reCAPTCHA v3のトークンを取得
            grecaptcha.ready(function () {
                grecaptcha.execute('6LdTCEUqAAAAAI6AkAc5CuVYcLPqPHlRXz0OG9Xj', { action: 'submit' })
                    .then(function (token) {
                        // reCAPTCHA v3のトークンをフォームデータに追加
                        const formData = new FormData(contactForm);
                        formData.append('recaptcha_response', token);

                        fetch('https://5kpdn47l2j4ovl3fuiuro2wf3q0oixif.lambda-url.ap-northeast-1.on.aws/', {
                            method: 'POST',
                            body: formData
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('reCAPTCHAとフォームデータが送信されました:', data);
                                // 送信後にフォームをリセット
                                contactForm.reset();
                            })
                            .catch(error => {
                                console.error('送信中にエラーが発生しました:', error);
                                alert('送信中にエラーが発生しました。');
                            });
                    });
            });
        });
    } else {
        console.error("Contact form element not found.");
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
    let time = 0;

    function animate() {
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

    animate();
});
