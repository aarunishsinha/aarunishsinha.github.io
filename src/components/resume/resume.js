import React, { Component } from 'react';
export default class Resume extends Component {
  render() {
    return (
      <React.Fragment>
      <section id="resume" className="s-resume target-section">
        <div className="row s-resume__section">
          <div className="column large-3 tab-12">
            <h3 className="section-header-allcaps">Experience</h3>
          </div>
          <div className="column large-9 tab-12">
            <div className="resume-block">
              <div className="resume-block__header">
                <h4 className="h3">Samsung R&D Institute, Delhi</h4>
                <p className="resume-block__header-meta">
                  <span>Enterprise S/W Intern</span>
                  <span className="resume-block__header-date">
                    June 2021 - July 2021
                  </span>
                </p>
              </div>
              <p>
                Built a Decentralised Application to communicate with a private Blockchain Network. Integrated the DApp with a private Ethereum Blockchain Network and a Token-based ecosystem. Designed an eCommerce UI in the application and connected it to a Recommender System using Flask API.
              </p>
            </div> {/* end resume-block */}
          </div>
        </div> {/* s-resume__section */}
        <div className="row s-resume__section">
          <div className="column large-3 tab-12">
            <h3 className="section-header-allcaps">Education</h3>
          </div>
          <div className="column large-9 tab-12">
            <div className="resume-block">
              <div className="resume-block__header">
                <h4 className="h3">Indian Institute of Technology, Delhi</h4>
                <p className="resume-block__header-meta">
                  <span>B.Tech. in Computer Science and Engineering</span>
                  <span className="resume-block__header-date">
                    Present
                  </span>
                </p>
              </div>
              <p>
                Pursuing a Bachelor of Technology in the Computer Science and Engineering Department at Indian Institute of Technology, Delhi.
              </p>
            </div> {/* end resume-block */}
          </div>
        </div> {/* s-resume__section */}
        <div className="row s-resume__section">
          <div className="column large-3 tab-12">
            <h3 className="section-header-allcaps">Technical Skills</h3>
          </div>
          <div className="column large-9 tab-12">
            <div className="resume-block">
              <p>
                I have worked with languages like Python, C++, Java, SQL, JavaScript, Solidity, OCaml.
              </p>
              <ul className="skill-bars-fat">
                <li>
                  <div className="progress percent80" />
                  <strong>Python</strong>
                </li>
                <li>
                  <div className="progress percent50" />
                  <strong>C++</strong>
                </li>
                <li>
                  <div className="progress percent60" />
                  <strong>Javascript</strong>
                </li>
                <li>
                  <div className="progress percent65" />
                  <strong>SQL</strong>
                </li>
                <li>
                  <div className="progress percent40" />
                  <strong>Java</strong>
                </li>
              </ul>
            </div> {/* end resume-block */}
          </div>
        </div> {/* s-resume__section */}
      </section>
      </React.Fragment>
    );
  }
}
