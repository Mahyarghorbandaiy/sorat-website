import React from 'react';
import { withRouter } from 'react-router';
import '../statics/stylesheet.css';

const heroImageStyles = {
  backgroundImage: '',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundColor: '#212121',
  display: 'flex',
  alignItems: 'center',
  minHeight: `calc(100vh - 271px)`
};

class Home extends React.Component {
  constructor(props) {
    super(props);
    if (JSON.parse(localStorage.getItem('feedForFilter'))) {
      localStorage.removeItem('feedForFilter');
    }

    this.state = { 
      loading: false, 
      openModal: false, 
      value: '', 
      data: [], 
      searchTerm: '' 
    };

    this.styles = {
      searchContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      },
      searchElementsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
      },
      searchResultContainer: {
        display: 'flex',
        flexBasis: '33%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      },
      resultItem: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: '0 0 33%'
      }
    };
  }

  startShopping = (category) => {
    const modifiedCategory = category.replace(/ /g, '%20');

    if (category === 'Services') {
      window.location.replace('https://www.soratwheels.ca/services.html');
    }

    this.setState({
      shoppingCategory: category,
      shoppingMethod: '',
      brandSelected: '',
      brandsList: [],
      productList: []
    });

    this.context.router.push('/' + modifiedCategory);
  };

  renderCategory = (imageUrl, category, disabled) => {
    return (
      <div className="categories-block__column">
        <div className="categories-block__column__imageContainer" style={{ position: 'relative' }}>
          <img 
            src={window.host + imageUrl} 
            style={{ width: '100%', height: '100%' }} 
            className={`categories-block__image`}
          />
          {category === 'Winter Packages' && (
            <div 
              className="mobile-view-ha" 
              style={{ textAlign: 'end', paddingRight: '30px' }} 
            />
          )}
          {/* {category === 'Seasonal Swap Over' && (
            <div 
              className="seasonal-overlay" 
              style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                backgroundColor: 'rgba(0, 0, 0, 0.7)', 
                color: 'white', 
                padding: '10px 15px', 
                borderRadius: '5px', 
                fontWeight: 'bold',
                fontSize: '14px',
                textAlign: 'center',
                zIndex: 2,
                width: '80%',
                maxWidth: '200px'
              }}
            >
              Winter Season (Sep 2025)
            </div>
          )} */}
        </div>
        <div className="categories-block__btn-container_after" />
        <div className="categories-block__btn-container">
          <button 
            disabled={disabled}
            className={`categories-block__btn ${disabled ? 'disabled-btn' : ''}`}
            onClick={() => this.startShopping(category)}
            style={{
              cursor: disabled ? 'not-allowed' : 'pointer',
              background: disabled ? '#ccc' : 'linear-gradient(135deg, #C50000 0%, #a00000 100%)',
              color: disabled ? '#666' : 'white',
              border: 'none',
              padding: '10px 2px',
              borderRadius: '2px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: disabled ? 'none' : '0 4px 15px rgba(197, 0, 0, 0.3)',
              width: '100%',
              // maxWidth: '160px',
              minHeight: '50px',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              lineHeight: '1.2',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
            onMouseOver={!disabled ? (e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(197, 0, 0, 0.4)';
            } : undefined}
            onMouseOut={!disabled ? (e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(197, 0, 0, 0.3)';
            } : undefined}
          >
            {category}
          </button>
        </div>
      </div>
    );
  };

  renderCategoryPanels = () => {
    return (
      <div className="categories-block__categories-box">
        <div id="categoryImageAndButtons" className="categories-block__row">
          {this.renderCategory('/statics/img/tires.jpg', 'Tires', false)}
          {this.renderCategory('/statics/img/wheels.jpg', 'Wheels', false)}
          {this.renderCategory('/statics/img/swap03.jpg', 'Seasonal Swap Over', false)}
          {/* {this.renderCategory('/statics/img/winterstore.jpg', 'in-store specials', false)} */}
          {this.renderCategory('/statics/img/winterstore.jpg', 'Services', false)}
        </div>
      </div>
    );
  };

  render() {
    return (
      <div id="heroImage" style={heroImageStyles}>
        <video 
          className="hoovideo" 
          autoPlay 
          loop 
          muted 
          src="https://soratwheels.ca/media/video/sorat-10-24.mp4" 
          type="video/ogg"
          style={{ position: 'fixed', left: '0', right: '0', width: '100%' }}
        />
        <div 
          className="breadcrumbbar__heroimage__home__div" 
          style={{ zIndex: '9'}}
        >
          <div 
            id="featureLineBlock" 
            className="breadcrumbbar__featureline__home"
          >
            <h1 className="breadcrumbbar__featureLineTitle">
              {/* Vancouver's Top Wheel and Tire Source   */}
            </h1>
          </div>
          <div className="breadcrumbbar__categoriesContainer">
            {this.state.loading ? (
              <div>
                <hr className="hr-black" />
                <p className="spinner-block__header">Select a Brand</p>
                <div style={{ textAlign: 'center', margin: 'auto' }}>
                  {navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || 
                  navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? (
                    <img src={window.host + '/statics/img/loading.svg'} />
                  ) : (
                    <img src={window.host + '/statics/img/loading.gif'} />
                  )}
                </div>
              </div>
            ) : (
              this.renderCategoryPanels()
            )}
          </div>
          <div className="breadcrumbbar__featureline__home_bottom">
            {/* <p className="breadcrumbbar__featuredLineContent"><em>  </em></p> */}
          </div>
        </div>
      </div>
    );
  }
}

Home.contextTypes = {
  router: React.PropTypes.object.isRequired
};

export default withRouter(Home);
