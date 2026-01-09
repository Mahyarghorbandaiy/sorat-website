import React from 'react';
import { withRouter } from 'react-router';
import R from 'ramda';
import App from './App';
import Home from './Home';
import Options from './Options';
import SearchBy from './SearchBy';
import Sizes from './Sizes';
import ProductList from './ProductList';
import BreadCrumbsBar from './subcomponents/BreadCrumbsBar';
import 'react-select/dist/react-select.css';
import { StickyContainer, Sticky } from 'react-sticky';
import '../statics/stylesheet.css';
import { Provider } from 'react-redux';
import store from './Cart/store';
import { connect } from 'react-redux';
import { addProduct } from './Cart/Actions/CartActions';
import FloatCart from './Cart/FloatCart';

const heroimage__tires = {
  backgroundImage: 'url("' + window.host + '/statics/img/tireshero.jpg")',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  width: '100%',
  minHeight: `calc(100vh - 271px)` 
};

const heroimage__wheels = {
  backgroundImage: 'url("' + window.host + '/statics/img/wheelshero.jpg")',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  width: '100%',
  minHeight: `calc(100vh - 271px)` 
};

const heroimage__winter = {
  backgroundImage: 'url("' + window.host + '/statics/img/")',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  width: '100%',
  minHeight: `calc(100vh - 271px)` 
};

/**
 * searches the parameters of a url
 * returns back a line of different links
 * do not display the breadCrumbBar on the homepage
 *
 * @param object params
 * @returns jsx the text in html representing the breadcrumb
 *
 * @memberOf BreadCrumbs
 */

/**
* @param {array} tireOption
* @param {object} this5
*/


/**
 * @caller:
 * index.js
 * calling route.push, will bring us back here
 */
class Main extends React.Component {
  constructor(props) {
    if (JSON.parse(localStorage.getItem('feedForFilter'))) {
      localStorage.removeItem('feedForFilter');
    }
    super(props);
    this.state = {
      value: [],
      hoolocation: [],
      hoocity: [],
      hoopostal: [],
      toggleChangeVehiclePanel: 'none',
      toggleFiltersPanel:
        this.props.params.size || this.props.params.search_by === 'Size' && this.props.params.options ?
          'block' :
          'none',

      //vehicleSelection state
      loading_VehicleSelection: false,
      isDisabled_selectYear: '',
      isDisabled_selectMake: 'disabled',
      isDisabled_selectModel: 'disabled',
      isDisabled_btn_Change: 'disabled',

      //vehicleSelection state
      year: '',
      make: '',
      model: '',
      filters: {},
      vehicles: {},
      view: window.innerWidth > 768 ? 'web' : 'mobile',
      filterPanelLeftPosition: -674
    };
  }

  componentWillMount() {
    this.getYears();
  }

  componentDidMount() {
    try {
      let vehicles = localStorage.getItem('vehicles');
      let vehicles_times = localStorage.getItem('vehicles_times') ? localStorage.getItem('vehicles_times') : '';

      try {
        vehicles = JSON.parse(vehicles);
      } catch (e) {
        console.log(e);
        vehicles = false;
      }

      let needRefreshVehicles = false;

      if (!vehicles) {
        vehicles = require('../utils/vehicle.json');
        needRefreshVehicles = true;
      } else if (new Date(vehicles_times) < new Date() || vehicles_times == '') {
        needRefreshVehicles = true;
      }

      this.setState({ vehicles });

      if (needRefreshVehicles) {
          fetch('https://www.soratwheels.ca/apii/getvehicle.php', {
          method: 'GET'
        })
          .then((response) => {
            return response.json();
          })
          .then((json) => {
            localStorage.setItem('vehicles', JSON.stringify(json));
            this.setState({ vehicles: json });
          })
          .catch((err) => {
            console.error(err);
          });

          let vehicles_times = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() + 2
          );
          localStorage.setItem('vehicles_times', vehicles_times);
      }
    } catch (e) {
      console.log(e);
    }
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  updateDimensions() {
    if (this.myInput !== null) {
      if (this.myInput.offsetWidth > 768) {
        this.setState({ view: 'web' });
      } else {
        this.setState({ view: 'mobile' });
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    const newState =
      (nextProps.params.size || nextProps.params.search_by === 'Size' && nextProps.params.options) &&
        this.state.view !== 'mobile' ?
        'block' :
        'none';
    this.setState({ toggleFiltersPanel: newState });
  }

  getSizesRevert(filter) {
    const sizeArr = [];
    if (filter.length === 0) {
      return this.props.params.size;
    }
    for (let i = 0; i < filter.length; i++) {
      sizeArr.push(filter[i].name);
    }

    return sizeArr.sort().join('-');
  }

  displayFilteredContent(selected, filters, category, p, router) {
    const selectedFilters = {};
    const wheelCategory = category === 'Wheels';
    const maxPrice = wheelCategory ? selected.wheelMaxPrice || 100000 : selected.tireMaxPrice || 100000;
    const minPrice = wheelCategory ? selected.wheelMinPrice || 0 : selected.tireMinPrice || 0;

    if (this.state.view === 'mobile') {
      this.setState({
        filterPanelLeftPosition: this.state.filterPanelLeftPosition === -674 ? -674 : -674
      });
      this.setState({ toggleFiltersPanel: 'none' });
      if (document.querySelector('.filter-overlay')) {
        document.querySelector('.filter-overlay').remove();
      }
    }

    if (wheelCategory) {
      router.push(
        '/' +
        p.category.replace(/ /g, '%20') +
        '/' +
        p.search_by +
        '/' +
        p.options.replace(/ /g, '%20') +
        '/' +
        this.getSizesRevert(selected.sizes) +
        '/'
      );
    }
    Object.keys(filters).forEach((filter) => {
      if (filters[filter].title === 'Min Price') {
        selectedFilters[filter] = minPrice;
        window.localStorage.setItem(filter, minPrice);
      } else if (filters[filter].title === 'Max Price') {
        selectedFilters[filter] = maxPrice;
        window.localStorage.setItem(filter, maxPrice);
      } else {
        selectedFilters[filter] = selected[filter];
        window.localStorage.setItem(filter, JSON.stringify(selected[filter]));
      }
    });
    this.setState({ filters: selectedFilters });
  }

  onChangeDdlGetMakes(event) {
    const year = event.target.value;

    this.setState({
      year,
      make: 'Make',
      model: 'Model',
      isDisabled_selectYear: 'disabled',
      isDisabled_selectMake: 'disabled',
      isDisabled_selectModel: 'disabled',
      isDisabled_btn_Change: 'disabled'
    });
    const data = this.state.vehicles;
    const dataYears = data[year];
    const unsortedMakes = Object.keys(dataYears);
    const sortedMakes = unsortedMakes.sort();
    this.setState({
      makes: sortedMakes,
      isDisabled_selectYear: '',
      isDisabled_selectMake: '',
      isDisabled_selectModel: 'disabled'
    });
  }

  onChangeDdlGetModels(event) {
    const make = event.target.value;

    this.setState({
      make,
      model: 'Model',
      isDisabled_selectYear: 'disabled',
      isDisabled_selectMake: 'disabled',
      isDisabled_selectModel: 'disabled',
      isDisabled_btn_Change: 'disabled'
    });

    const data = this.state.vehicles;
    const dataYears = data[this.state.year];
    const dataMakes = dataYears[make];
    const unsortedModels = dataMakes;
    const sortedModels = unsortedModels.sort();
    this.setState({
      models: sortedModels,
      isDisabled_selectYear: '',
      isDisabled_selectMake: '',
      isDisabled_selectModel: ''
    });
  }

  onChangeDdlSetModelToState(event) {
    const model = event.target.value;
    this.setState({ model, isDisabled_btn_Change: '' });
  }

  getYears() {
    if (this.state.years) {
      return;
    }

    this.setState({
      isDisabled_selectYear: 'disabled',
      isDisabled_selectMake: 'disabled',
      isDisabled_selectModel: 'disabled',

      make: 'Make',
      model: 'Model',
      year: 'Year'
    });

    const data = this.state.vehicles;
    this.setState({
      years: Object.keys(data).reverse(),
      isDisabled_selectYear: '',
      isDisabled_selectMake: 'disabled',
      isDisabled_selectModel: 'disabled'
    });
  }

  onClickGetVehicleResults() {
    this.clearLocalStorage();
    window.localStorage.setItem('carYear', this.state.year);
    window.localStorage.setItem('carMake', this.state.make);
    window.localStorage.setItem('carModel', this.state.model);

    fetch(window.baseUrl + '/search/tires/vehicle/year/' + this.state.year + '/make/' + this.state.make + '/model/' + this.state.model)
    .then(response => {
      return response.json();
    }).then(json => {
      localStorage.setItem('Offset_range', Object.values(json.Offset_range));
      localStorage.setItem('Lugnut_Type', Object.values(json.Lugnut_Type));
      localStorage.setItem('Lugnut_Size', Object.values(json.Lugnut_Size));
      localStorage.setItem('Center_bore', Object.values(json.Center_bore));
      localStorage.setItem('bolt_pattern', Object.values(json.bolt_pattern));
    });

    const { category, search_by } = this.props.params;
    const modifiedMake = this.state.make.split(' ').join('%20');
    const modifiedModel1 = this.state.model.split(' ').join('%20');
    const modifiedModel2 = modifiedModel1.split('/').join('|');
    const urlVehicleSelection =
      '/' +
      category.replace(/ /g, '%20') +
      '/' +
      search_by +
      '/' +
      this.state.year +
      '!' +
      modifiedMake +
      '!' +
      modifiedModel2;
    this.context.router.push(urlVehicleSelection); // #/Tires/Vehicle/2016!BENTLEY!CONTINENTAL%20GT
  }

  cbVehicleSelection(stateBubbledUp) {
    this.setState(stateBubbledUp);
  }

  clearLocalStorage = () => {
    window.localStorage.removeItem('performanceCategories');
    window.localStorage.removeItem('speedRatings');
    window.localStorage.removeItem('wheelBrands');
    window.localStorage.removeItem('tireBrands');
    window.localStorage.removeItem('wheelMinPrice');
    window.localStorage.removeItem('wheelMaxPrice');
    window.localStorage.removeItem('tireMinPrice');
    window.localStorage.removeItem('tireMaxPrice');
    window.localStorage.removeItem('finish');
    window.localStorage.removeItem('sizes');
    window.localStorage.removeItem('width');
    window.localStorage.removeItem('tireSpecials');
    window.localStorage.removeItem('wheelSpecials');
    window.localStorage.removeItem('customsizing');
  };

  // hooman filter button
  renderBreadCrumbsBar = () => {
    if (this.state.view === 'mobile') {
      const { category, search_by, options, size } = this.props.params;
      const onChangeTogglePanel = (panelStateKey) => {

        if (this.state.view !== 'mobile' && category === 'Wheels' && (search_by === 'Vehicle' || search_by === 'Size')) {
          if (!localStorage.getItem('houmanfilter')) {
            document.querySelector('div.houman1').style = 'display: none';
            document.querySelector('div.slider-container').style = 'margin-top: ';
            localStorage.setItem('houmanfilter', 'off');
          } else {
            document.querySelector('div.houman1').style = 'display: ; width: 100%; height: 120px; position: fixed; z-Index: 99; background-Color: #333333; background-size: cover; background-Image: url(https://soratwheels.com/wp-content/uploads/2021/08/header-cover-image.png) ';
            localStorage.removeItem('houmanfilter');
            document.querySelector('div.slider-container').style = 'margin-top: 100px';
          }

        }

        const newState = {};
        newState[panelStateKey] = this.state[panelStateKey] === 'none' ? 'block' : 'none';

        this.setState(newState);

        // mobile overlay
        if (this.state.view !== 'mobile') {return;}
        const checkOverlay = document.querySelector('.filter-overlay');
        let overlay = null;
        if (checkOverlay === null) {
          overlay = document.createElement('div');
          overlay.className = 'filter-overlay';
          document.querySelector('.page-wrapper').append(overlay);
        } else {
          document.querySelector('.filter-overlay').remove();
        }

        this.setState({
          filterPanelLeftPosition: this.state.filterPanelLeftPosition === 0 ? -674 : 0
        });
      };

      return (
        <div id="bcb_tires" className="breadcrumbbar__breadcrumbbar">
          <BreadCrumbsBar category={category} searchByOption={search_by} optionType={options} size={size} />
          {size &&
            <div className="breadcrumbbar__filterButtons">
              <span id="filterButtons2a" className="breadcrumbbar__filterPosition">
                {this.state.toggleFiltersPanel === 'block' ?
                  <button
                    className="breadcrumbbar__filterbtn__clicked"
                    onClick={() => onChangeTogglePanel('toggleFiltersPanel')}
                  >
                    Filters
                    &#9650;
                  </button> :
                  <button
                    className="breadcrumbbar__filterbtn"
                    onClick={() => onChangeTogglePanel('toggleFiltersPanel')}
                  >
                    Filters
                    &#9660;
                  </button>
                }
              </span>
            </div>
          }
        </div>
      );
    }

  };

  renderFilters = () => {
    const { params } = this.props;
    const { category, size } = this.props.params;
    const isNotNil = (x) => !R.isNil(x);
    const isSize = isNotNil(size);
    const heroImageStyles = category === 'Tires' ? heroimage__tires : category === 'Wheels' ? heroimage__wheels : null;
    const filterType = category === 'Winter Packages' ? 'wheels' : category.toLowerCase();

    return (
      <div id="heroimage">
        <div
          className="head_filter"
          style={{
            left: this.state.filterPanelLeftPosition,
            transition: 'left 0.6s linear, display 0.6s linear'
          }}
        >
        </div>
      </div>
    );
  };

  renderContent = () => {
    const { params } = this.props;
    const { size } = this.props.params;
    const isNotNil = (x) => !R.isNil(x);
    const isSize = isNotNil(size);
    let content;
    if (isSize) {
      content =
        (<ProductList
          params={params}
          filters={this.state.filters}
          whenClicked={() =>
            this.setState({
              wheelFilters_sizeFilter: this.getObjectSizes(size)
            })}
        />)
        ;
    } else {
      content = <Sizes params={params} filters={this.state.filters} />;
    }
    return (
      <div id="contentList" className="breadcrumbbar__contentListBlock">
        {content}
      </div>
    );
  };

  render() {
    const p = this.props.params;
    let content;
    const isNotNil = (x) => !R.isNil(x);
    const isCategory = isNotNil(p.category);
    const isSearchBy = isNotNil(p.search_by);
    const isOptions = isNotNil(p.options);

    p.size = p.search_by === 'Size' && p.options ? p.options : p.size;
    const isSize = isNotNil(p.size);

    const displayHome = !isCategory;
    const displaySearchOptions = !isSearchBy && !isOptions;
    const displayOptionResults = isSearchBy && !isOptions;
    const displayContent = isOptions;

    if (!isSize) {
      this.clearLocalStorage();
    }

    return (
      <Provider store={store}>
        <div
          ref={(input) => {
            this.myInput = input;
          }}
          style={{ width: '100%' }}
        >
      <FloatCart />

<div className="tooltiphouman" style={{ top: '0px', position: 'fixed', zIndex: '99999', color: 'white', width: '300px', left: '47%' }}>
  { window.localStorage.getItem('carModel') ?
  <p style={{ color: 'white', padding: '10px', paddingLeft: '1%' }}> { window.localStorage.getItem('carYear') + ' ' + window.localStorage.getItem('carMake') + ' ' + window.localStorage.getItem('carModel')} </p> :
   <p />}

{ window.localStorage.getItem('carModel') ?
  <span className="tooltiptexthouman" style={{ width: '200px' }}>
  <p style={{ color: 'white' }}> { ' Offset range : ' + window.localStorage.getItem('Offset_range') } </p>
  <p style={{ color: 'white' }}> { ' Center bore : ' + window.localStorage.getItem('Center_bore') } </p>
  <p style={{ color: 'white' }}> { ' bolt pattern : ' + window.localStorage.getItem('bolt_pattern') } </p>
  <p style={{ color: 'white' }}> { ' Lugnut Size : ' + window.localStorage.getItem('Lugnut_Size') } </p>
  <p style={{ color: 'white' }}> { ' Lugnut Type : ' + window.localStorage.getItem('Lugnut_Type') } </p>

  </span> : <span /> }

</div>
          <App>
            {displayHome ?
              <Home /> :
              <div id="heroimage" className={p.category === 'in-store specials' ? 'in-store-specials' : ''} style={p.category === 'Tires' ? heroimage__tires : p.category === 'Wheels' ? heroimage__wheels : p.category === 'Seasonal Swap Over' ? heroimage__tires : heroimage__winter  }>
                <StickyContainer style={{ zIndex: 4 }}>
                  <Sticky className="breadcrumbbar__stickyMobileChanges">
                    {this.renderBreadCrumbsBar()}
                    {displayContent && this.renderFilters()}
                  </Sticky>
                  {displaySearchOptions && <SearchBy params={p} />}
                  {displayOptionResults &&
                    <Options params={p} cbVehicleSelection={this.cbVehicleSelection.bind(this)} />
                  }
                  {displayContent && this.renderContent()}
                </StickyContainer>
              </div>
            }
          </App>
        </div>
      </Provider>
    );
  }

  getObjectSizes(sizes) {
    const returnArray = [];
    if (sizes === '') {
      return [];
    }
    const sizesArray = sizes.split('-');
    for (let i = 0; i < sizesArray.length; i++) {
      returnArray.push({ id: sizesArray[i], name: sizesArray[i] });
    }
    return returnArray;
  }
}

Main.propTypes = {
  params: React.PropTypes.object
};

Main.contextTypes = {
  router: React.PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  cartProducts: state.cart.products,
  newProduct: state.cart.productToAdd,
  productToRemove: state.cart.productToRemove,
  productToChange: state.cart.productToChange,
  cartTotal: state.total.data
});

export default withRouter(Main);
connect(mapStateToProps, { addProduct });
