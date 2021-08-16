import React, { Component } from 'react';
export default class Header extends Component {
  render() {
    return (
      <React.Fragment>
      <header id="home">
        <div class="row s-header__nav-wrap">
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
                I'm a <span>Senior Undergraduate Student</span> majoring in <span>Computer Science and Engineering</span> at <span>Indian Institute of Technology, Delhi</span>. Let's <a className="smoothscroll" href="#about">start scrolling</a>
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
      </section>
      </React.Fragment>
    );
  }
}
