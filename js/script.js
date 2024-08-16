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
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
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
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        skillLevel.style.width = width;
                    });
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 }); // threshold を小さくして早めに検出

    skillBars.forEach(bar => skillObserver.observe(bar));


    // スクロールアニメーション用の関数
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

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const recaptchaResponse = grecaptcha.getResponse();

        if (!recaptchaResponse) {
            alert('reCAPTCHAを完了してください。');
            return;
        }

        // reCAPTCHAが完了した場合、フォーム送信を進める
        // ここで通常はサーバーにフォームデータを送信します
        console.log('reCAPTCHAでフォームが送信されました');

        // 送信後にフォームとreCAPTCHAをリセット
        contactForm.reset();
        grecaptcha.reset();
    });
});

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }, 300);
}