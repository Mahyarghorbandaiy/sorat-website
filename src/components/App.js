import React from 'react';
import { withRouter } from 'react-router';
import 'whatwg-fetch';
import styles from '../statics/styles';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }

  render() {
    return (
      <div className='main-container' style={styles.mainContainer}>
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.element.isRequired
};

App.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default withRouter(App);
