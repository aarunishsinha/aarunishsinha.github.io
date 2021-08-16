import React, { Component } from 'react';
export default class Header extends Component {
  render() {
    return (
      <React.Fragment>
      <header id="home">
        <div class="row s-header__nav-wrap fixed-top">
            <nav class="s-header__nav">
                <ul>
                    <li class="current"><a class="smoothscroll" href="#hero">Home</a></li>
                    <li><a class="smoothscroll" href="#about">About</a></li>
                    <li><a class="smoothscroll" href="#resume">Resume</a></li>
                    <li><a class="smoothscroll" href="#portfolio">Works</a></li>
                    <li><a class="smoothscroll" href="#testimonials">Testimonials</a></li>
                    <li><a class="smoothscroll" href="#contact">Say Hello</a></li>
                </ul>
            </nav>
        </div>

        <a class="s-header__menu-toggle" href="#0" title="Menu">
            <span class="s-header__menu-icon"></span>
        </a>
      </header>
      <section id="hero" className="s-hero target-section">
        <div className="s-hero__bg rellax" data-rellax-speed={-7} />
        <div className="row s-hero__content">
          <div className="column">
            <div className="s-hero__content-about">
              <h1>I'm Aarunish Sinha.</h1>
              <h3>
                I'm a <span>Senior Undergraduate Student</span> majoring in <span>Computer Science and Engineering</span> at <span>Indian Institute of Technology, Delhi</span>. Let's <a className="smoothscroll" href="#about">start scrolling </a>
                 and learn more <a className="smoothscroll" href="#about">about me</a>.
              </h3>
              <div className="s-hero__content-social">
                <a href="https://www.facebook.com/Aarunish"><i className="fab fa-facebook-square" aria-hidden="true" /></a>
                {/* <a href="#0"><i className="fab fa-twitter" aria-hidden="true" /></a> */}
                <a href="https://www.instagram.com/aarunish/"><i className="fab fa-instagram" aria-hidden="true" /></a>
                {/*<a href="#0"><i className="fab fa-dribbble" aria-hidden="true" /></a> */}
                {/*<a href="#0"><i className="fab fa-behance" aria-hidden="true" /></a> */}
                <a href="https://www.linkedin.com/in/aarunish-sinha-360ab1193/"><i className="fab fa-linkedin" aria-hidden="true" /></a>
              </div>
            </div> {/* end s-hero__content-about */}
          </div>
        </div>
        <div className="s-hero__scroll">
          <a href="#about" className="s-hero__scroll-link smoothscroll">
            <span className="scroll-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" style={{fill: 'rgba(0, 0, 0, 1)', transform: '', msFilter: ''}}><path d="M18.707 12.707L17.293 11.293 13 15.586 13 6 11 6 11 15.586 6.707 11.293 5.293 12.707 12 19.414z" /></svg>
            </span>
            <span className="scroll-text">Scroll Down</span>
          </a>
        </div>
      </section>
      </React.Fragment>
    );
  }
}
