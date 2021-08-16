import React, { Component } from 'react';
export default class Footer extends Component {
  render() {
    return (
      <React.Fragment>
      <footer className="s-footer">
        <div className="row">
          <div className="column large-4 medium-6 w-1000-stack s-footer__social-block">
            <ul className="s-footer__social">
              <li><a href="https://www.facebook.com/Aarunish"><i className="fab fa-facebook-f" aria-hidden="true" /></a></li>
              <li><a href="https://www.instagram.com/aarunish/"><i className="fab fa-instagram" aria-hidden="true" /></a></li>
              <li><a href="https://www.linkedin.com/in/aarunish-sinha-360ab1193/"><i className="fab fa-linkedin-in" aria-hidden="true" /></a></li>
            </ul>
          </div>
        </div>
        <div className="ss-go-top">
          <a className="smoothscroll" title="Back to Top" href="#top">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 4h12v2H6zm5 10v6h2v-6h5l-6-6-6 6z" /></svg>
          </a>
        </div> {/* end ss-go-top */}
      </footer>
      </React.Fragment>
    );
  }
}
