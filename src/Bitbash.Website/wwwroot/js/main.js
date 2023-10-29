(function () {
    "use strict";

    /**
     * Easy selector helper function
     */
    // const select = (el, all = false) => {
    //     el = el.trim()
    //     if (all) {
    //         return [...document.querySelectorAll(el)]
    //     } else {
    //         return document.querySelector(el)
    //     }
    // }

    /**
     * Easy event listener function
     */
    // const on = (type, el, listener, all = false) => {
    //     let selectEl = select(el, all)
    //     if (selectEl) {
    //         if (all) {
    //             selectEl.forEach(e => e.addEventListener(type, listener))
    //         } else {
    //             selectEl.addEventListener(type, listener)
    //         }
    //     }
    // }

    /**
     * Easy on scroll event listener 
     */
    // const onscroll = (el, listener) => {
    //     el.addEventListener('scroll', listener)
    // }

    /**
     * Navbar links active state on scroll
     */
    // let navbarlinks = select('#navbar .scrollto', true)
    // const navbarlinksActive = () => {
    //     let position = window.scrollY + 200
    //     navbarlinks.forEach(navbarlink => {
    //         if (!navbarlink.hash) return
    //         let section = select(navbarlink.hash)
    //         if (!section) return
    //         if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
    //             navbarlink.classList.add('active')
    //         } else {
    //             navbarlink.classList.remove('active')
    //         }
    //     })
    // }
    // window.addEventListener('load', navbarlinksActive)
    // onscroll(document, navbarlinksActive)

    /**
     * Scrolls to an element with header offset
     */
    // const scrollto = (el) => {
    //     let header = select('#header')
    //     let offset = header.offsetHeight

    //     if (!header.classList.contains('header-scrolled')) {
    //         offset -= 20
    //     }

    //     let elementPos = select(el).offsetTop
    //     window.scrollTo({
    //         top: elementPos - offset,
    //         behavior: 'smooth'
    //     })
    // }







    /**
     * Scrool with ofset on links with a class name .scrollto
     */
    on('click', '.scrollto', function (e) {
        if (select(this.hash)) {
            e.preventDefault()

            let navbar = select('#navbar')
            if (navbar.classList.contains('navbar-mobile')) {
                navbar.classList.remove('navbar-mobile')
                let navbarToggle = select('.mobile-nav-toggle')
                navbarToggle.classList.toggle('bi-list')
                navbarToggle.classList.toggle('bi-x')
            }
            scrollto(this.hash)
        }
    }, true)

    /**
     * Scroll with ofset on page load with hash links in the url
     */
    window.addEventListener('load', () => {
        if (window.location.hash) {
            if (select(window.location.hash)) {
                scrollto(window.location.hash)
            }
        }
    });

    /**
     * Animation on scroll
     */
    window.addEventListener('load', () => {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        })
    });

})()

/**
 * Initializes all header script including scroll effect
 * and mobile navigation.
 */
function InitializeHeader() {
    InitializeHeaderScrollEffect();
    InitializeMobileNavigation();
}

/**
 * Toggle .header-scrolled class to header when page is scrolled
 */
function InitializeHeaderScrollEffect() {
    let selectHeader = document.querySelector('#header');
    if (selectHeader) {
        const headerScrolled = () => {
            if (window.scrollY > 50) {
                selectHeader.classList.add('header-scrolled')
            } else {
                selectHeader.classList.remove('header-scrolled')
            }
        }
        document.addEventListener('scroll', headerScrolled);
        headerScrolled();
    }
}

/**
 * Navbar links active state on scroll
 */
function InitializeMobileNavigation() {
    
    // Mobile nav toggle
    on('click', '.mobile-nav-toggle', function (e) {
        select('#navbar').classList.toggle('navbar-mobile')
        this.classList.toggle('bi-list')
        this.classList.toggle('bi-x')
    })

    /**
     * Mobile nav dropdowns activate
     */
    on('click', '.navbar .dropdown > a', function (e) {
        if (select('#navbar').classList.contains('navbar-mobile')) {
            e.preventDefault()
            this.nextElementSibling.classList.toggle('dropdown-active')
        }
    }, true)
}


// let navbarlinks = [...document.querySelectorAll('#navbar .scrollto')];
// const navbarlinksActive = () => {
//     let position = window.scrollY + 200
//     navbarlinks.forEach(navbarlink => {
//         if (!navbarlink.hash) return
//         let section = document.querySelector(navbarlink.hash)
//         if (!section) return
//         if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
//             navbarlink.classList.add('active')
//         } else {
//             navbarlink.classList.remove('active')
//         }
//     })
// }
// window.addEventListener('load', navbarlinksActive)
// onscroll(document, navbarlinksActive)

/**
 * Back to top button
 */
function InitializeBackToTopButton() {
    let backtotop = document.querySelector('.back-to-top')
    if (backtotop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backtotop.classList.add('active')
            } else {
                backtotop.classList.remove('active')
            }
        }
        window.addEventListener('load', toggleBacktotop)
        document.addEventListener('scroll', toggleBacktotop)
    }
}


    /**
     * Scrolls to an element with header offset
     */
    function scrollToElement(id) {
        let header = document.querySelector('#header')
        let offset = header.offsetHeight

        if (!header.classList.contains('header-scrolled')) {
            offset -= 20
        }

        let element = document.querySelector(id);
        if (element)
        {
            let elementPos = element.offsetTop
            window.scrollTo({
                top: elementPos - offset,
                behavior: 'smooth'
            })
        }
    }
