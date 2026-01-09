import React from 'react';
import '../statics/stylesheet.css';
import {
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Dialog,
  Select,
  MenuItem
} from 'material-ui';
import Button from 'material-ui/Button';
import R, { ifElse, partialObject, sort } from 'ramda';
import AddToCartPopup from './AddToCartPopup';
import { connect } from 'react-redux';
import { addProduct } from './Cart/Actions/CartActions';
import color from 'material-ui/colors/amber';


const sortSliders = sliders => {
  const cbCompare = (a, b) => {
    if (a.group < b.group) {
      return -1;
    }
    if (a.group > b.group) {
      return 1;
    }
    return 0;
  };
  return sliders.sort(cbCompare);
};

const groupByAttr = (products, attribute) => {
  const output = {};
  for (let i = 0; i < products.length; i++) {
    let grp = products[i][attribute];
    if (grp === '') {
      grp = 'default';
    }
    if (Object.keys(output).indexOf(grp) >= 0) {
      output[grp].push(products[i]);
    } else {
      output[grp] = [products[i]];
    }
  }
  return output;
};

const getPrices = (size, children) => {
  const tempArray = [];
  for (let i = 0; i < children.length; i++) {
    for (let j = 0; j < size.length; j++) {
      if (size[j] === children[i].wheel_size) {
        const price = children[i].special_price && children[i].special_price !== '' ? children[i].special_price : children[i].price;
        tempArray.push(price);
      }
    }
  }
  return tempArray;
};

const getShipping = (product, sizes) => {
  if (product.Shipping) {
    return product.Shipping;
  }
  return product.children.filter((child) => {
    if (sizes) {
      return sizes.includes(child.wheel_size);
    }
    return true;
  }).map((child) => child.Shipping).reduce((shipping, curr) => {
    if (shipping.includes('Call')) {
      return curr;
    } else if (!shipping.includes('Vancouver') && curr.includes('Vancouver')) {
      return curr;
    } else if (shipping.includes('Vancouver') && curr.includes('Vancouver') &&
      !shipping.includes('10') && curr.includes('10')) {
      return curr;
    }
    return shipping;

  }, 'Not Stock Call for ETA');

};

const FilterTitles = {
  tread_width: 'Tread Width',
  wheel_profile: 'Wheel Profile',
  wheel_size: 'Wheel Size',
  wheel_width: 'Wheel Width',
  bolt_pattern_1: 'Bolt Pattern 1',
  bolt_pattern_2: 'Bolt Pattern 2',
  offsetmm: 'Offset',
  speed_rating: 'Speed Rating',
  load_index: 'Load Index',
  center_bore: 'Center Bore'
};

class ImageSlider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      allData: props.productData,
      newdata: [],
      widthselected: '',
      colorselected: '',
      brandselected: '',
      performanceselected: '',
      speedselected: '',
      loadindexselected: '',
      Vancouverselected: true,
      filterstatus: false,
      priceselected: '',
      rftselected: '',
      priceMAXselected: '',
      isFilterOpen: false,
      isFilterPanelVisible: false,
      isShaking: false,
      openDialog: false,
      showImage: false, 
      imageUrl: '',
      showFullScreenImage: false,
      fullScreenImageUrl: '',
      showVehicleModal: false,
      modalYear: '',
      modalMake: '',
      modalModel: '',
      modalMakes: [],
      modalModels: []
    };
    this.toggleFilterPanel = this.toggleFilterPanel.bind(this);
    this.startShaking = this.startShaking.bind(this);

    this.mainStyles = {
      main: {
        display: 'flex',
        flexDirection: 'row-reverse'
      },
      container: {
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        boxSizing: 'border-box',
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: 1280,
        paddingLeft: 10,
        paddingRight: 10,

      },
      productMedia: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '40%'
      },
      productInfoMain: {
        display: 'flex',
        justifyContent: 'center',
        width: '60%',
        flexDirection: 'column'
      },
      topBarInfo: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        lineHeight: '20px'
      }
    };
  }

  componentDidMount() {
    this.startShaking();
  }

  componentWillUnmount() {
    clearInterval(this.shakeInterval);
  }

  startShaking() {
    this.shakeInterval = setInterval(() => {
      this.setState({ isShaking: true });
      setTimeout(() => {
        this.setState({ isShaking: false });
      }, 500);
    }, 5000); 
  }

  getProductName = (product) => {
    if (product.tire_manufacturer) {
      return product.model;
    } else if (product.wheel_manufacturer) {
      return product.model + ' - ' + product.wheel_finish;
    }
    return product.name;
  }

  collectProductInfo = (product) => {
    const { category, search_by, size, options } = this.props.params;
    let sizes = '';
    const items = {};

    if (category === 'Wheels' && (search_by === 'Vehicle' || search_by === 'Size') || category === 'Winter Packages') {
      sizes = size.replace(/--/g, ',');

      if (search_by === 'Size') {
        const itemsList = size.split('--');
        
        items.staggered = itemsList.length === 5;
        items.wheel_size = itemsList[0] ? itemsList[0] : '';

        items.bolt_pattern = itemsList[1] ? itemsList[1] : '';
        if (itemsList[2]) {
          const offsets = itemsList[2].split('_');
          items.offset_min = offsets[0] ? offsets[0] : '';
          items.offset_max = offsets[1] ? offsets[1] : '';
        }

      } else {
        let bolt_pattern = product.bolt_pattern_1;
        if (product.bolt_pattern_2 && product.bolt_pattern_2 !== 'Not Available') {
          if (bolt_pattern) {
            bolt_pattern += ',';
          }
          bolt_pattern += product.bolt_pattern_2;
        }
        items.staggered = window.sessionStorage.getItem('Staggered');
        items.wheel_size = sizes;
        items.bolt_pattern = bolt_pattern;
        items.offset_min = product.offsetmm_min;
        items.offset_max = product.offsetmm_max;
      }
    } else if (category === 'Tires' && (search_by === 'Size' || search_by === 'Vehicle')) {
      sizes = search_by === 'Size' ? options.split('-') : size ? size.split('-') : [];
      if (sizes.length > 3) {
        const front = sizes[0] + '-' + sizes[1] + '-' + sizes[2];
        const back = sizes[3] + '-' + sizes[4] + '-' + sizes[5];
        items.front = front;
        items.back = back;
        items.staggered = true;
      }
    }
    return items;
  }

  createUrl = (product) => {
    const items = this.collectProductInfo(product);
    const params = Object.entries(items).filter(x => x[1]).map(f => f[0] + '=' + f[1]).join('&');
    const url = window.baseUrl + '/' + product.url_key + '.html' + (params ? '?' + params : '');

    return url;
  }

  productClick(e, product) {
    const { category, search_by, size, options } = this.props.params;

    if (category === 'Wheels' || category === 'Winter Packages' || category === 'Tires' ) {
      this.handleOpenDialog(product);

      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }
  }

  renderSliders = (idd) => {
    // const { productData, groupAttr, searchBy } = this.props;
    const { groupAttr, searchBy } = this.props;
    const productData = idd;
    const { category, search_by, size, options } = this.props.params;
    const grouped = groupByAttr(productData, groupAttr);

    const sliders = Object.keys(grouped).map(group => {
      return grouped[group];
    }).map((products, j) => {
      let grp = products[0][groupAttr];

      if (grp === '') {
        grp = 'Default';
      }

      const productsCompare = (a, b) => {
        if (this.getProductName(a) < this.getProductName(b)) {
          return -1;
        }
        if (this.getProductName(a) > this.getProductName(b)) {
          return 1;
        }
        return 0;
      };

      return {
        group: grp,
        products: products.sort(productsCompare).map((product, i) => {
          if (!product.url_key) { return ''; }
          const url = this.createUrl(product);
          let price = category === 'Wheels' && (search_by === 'Vehicle' || search_by === 'Size') || category === 'Winter Packages' ? getPrices(size.split('-'), product.children) : [];
          let sizes = [];
          if (category === 'Tires' && (search_by === 'Size' || search_by === 'Vehicle')) {
            sizes = search_by === 'Size' ? options.split('-') : size.split('-');
            if (sizes.length > 3) {
              //staggered
              price = [product['front-price'], product['back-price']];
            }
          }

          const shipping = getShipping(product, size ? size.split('-') : undefined);

          return (
            <a key={j * 1000 + i}  onClick={e => {
              this.productClick(e, product);
            }}
              className="image-slider__productItem__productLink tooltip" >
              {!product.wheel_finish && product.name && category === 'Tires' && search_by !== 'Brand' &&
                <h3 className="image-slider__productItem__productLabel img_product_name">{
                  product.tire_manufacturer + ' ' + product.model}</h3>}
 
              {category === 'Tires' && search_by === 'Brand' &&
               <h3 className="image-slider__productItem__productLabel img_product_name">{this.getProductName(product)}
               </h3>}

              {product.wheel_finish && product.model &&
                <h5 className="image-slider__productItem__productLabel img_product_sublabel">{product.model}</h5>}

              {product.wheel_finish && category === 'Wheels' && search_by === 'Brand' &&
              
                <p className="image-slider__productItem__productLabel img_product_name">{product.wheel_finish}</p>}

              <div className="image-slider__productItem__productImageContainer " style={{ position: 'relative' }}>

                  { category !== 'Tires' && (product.image === 'no_selection' || product.image === '' || product.image === null) ?
                     <img src={window.baseUrl + '/media/soratimg.jpg'}
                       className="image-slider__productItem__productImage" /> :
                       category !== 'Tires' && (product.image.includes('https://') || product.image.includes('directautoimport')) ?
                           <img src={product.image}
                                width="250"
                                height="250" /> :
                                category !== 'Tires' && (product.image.includes('wheelpros') || product.image.includes('https://wheel')) ?
                                <img src={product.image}
                                     width="250"
                                     height="250" /> : category !== 'Tires' &&  <img src={window.baseUrl + '/pub/media/catalog/product' + product.image}
                               width="250"
                               height="250" />
                  }

                    {
                      category === 'Tires' 
                      && (
                        product.priority !== undefined
                          ? product.priority === "0"
                          : (product['back-priority'] === "0" || product['front-priority'] === "0")
                      )
                      && search_by !== 'Brand'
                      && (product.image === 'no_selection' || product.image === '')
                      ? (
                        <img
                          src={window.baseUrl + '/media/soratimg.jpg'}
                          className="image-slider__productItem__productImage"
                          style={{ filter: 'opacity(0.3)' }}
                        />
                      ) :
                      category === 'Tires'
                      && (
                        product.priority !== undefined
                          ? product.priority !== "0"
                          : (product['back-priority'] !== "0" && product['front-priority'] !== "0")
                      )
                      && search_by !== 'Brand'
                      && (product.image === 'no_selection' || product.image === '')
                      ? (
                        <img
                          src={window.baseUrl + '/media/soratimg.jpg'}
                          className="image-slider__productItem__productImage"
                        />
                      ) :
                      category === 'Tires'
                      && (
                        product.priority !== undefined
                          ? product.priority === "0"
                          : (product['back-priority'] === "0" || product['front-priority'] === "0")
                      )
                      && search_by !== 'Brand'
                      && (product.image && product.image.indexOf('https://panel.sorat.ca') !== -1)
                      ? (
                        <img
                          src={product.image}
                          width="250"
                          height="250"
                          style={{ filter: 'opacity(0.3)' }}
                        />
                      ) :
                      category === 'Tires'
                      && (
                        product.priority !== undefined
                          ? product.priority !== "0"
                          : (product['back-priority'] !== "0" && product['front-priority'] !== "0")
                      )
                      && search_by !== 'Brand'
                      && (product.image && product.image.indexOf('https://panel.sorat.ca') !== -1)
                      ? (
                        <img
                          src={product.image}
                          width="250"
                          height="250"
                        />
                      ) :
                      category === 'Tires'
                      && search_by !== 'Brand'
                      && (
                        <img
                          src={window.baseUrl + '/pub/media/catalog/product' + product.image}
                          width="250"
                          height="250"
                        />
                      )
                    }

                  { category === 'Tires' && search_by === 'Brand' && (product.image === 'no_selection' || product.image === '') ?
                      <img src={window.baseUrl + '/media/soratimg.jpg'}
                        className="image-slider__productItem__productImage"/> :
                        category === 'Tires' && search_by === 'Brand' && product.image.includes('https://panel.sorat.ca') ?
                        <img src={product.image}
                                  width="250"
                                  height="250" /> :               
                        category === 'Tires' &&  search_by === 'Brand' && <img src={window.baseUrl + '/pub/media/catalog/product' + product.image}
                                width="250"
                                height="250" />
                  } 

                {category === 'Tires' && product.performance_category === 'Winter' &&
                  <img src={'https://www.soratwheels.ca/media/snowtag.png'} style={{ width: '40px', position: 'absolute', left: '20%', top: '0px' }} />
                }

                {category === 'Tires' && product.performance_category === 'Summer' &&
                  <img src={'https://www.soratwheels.ca/media/summer.png'} style={{ width: '30px', position: 'absolute', left: '20%', top: '0px' }} />
                }

                {category === 'Tires' && product.performance_category === 'All Season' &&
                  <img src={'https://www.soratwheels.ca/media/allseason.png'} style={{ width: '30px', position: 'absolute', left: '20%', top: '0px' }} />
                }

                {category === 'Tires' && product.performance_category === 'All Weather' &&
                  <img src={'https://www.soratwheels.ca/media/allweather.png'} style={{ width: '30px', position: 'absolute', left: '20%', top: '0px' }} />
                }

                {category === 'Wheels' && (search_by === 'Vehicle' || search_by === 'Size') && parseInt(product.children[0].promo).toFixed(2) && parseInt(product.children[0].promo).toFixed(2) > 0 && (parseInt(product.children[0].promo).toFixed(2) !== parseInt(product.children[0].price).toFixed(2)) &&
                  <img src={window.host + '/statics/img/sale.png'} className="image-slider_sale" />
                }

              </div>

              {category === 'Wheels' && (search_by === 'Vehicle' || search_by === 'Size') &&  parseInt(product.children[0].promo).toFixed(2) && parseInt(product.children[0].promo).toFixed(2) > 0 && (parseInt(product.children[0].promo).toFixed(2) !== parseInt(product.children[0].price).toFixed(2)) &&
                <p className="image-slider__productItem__productLabel mobile-only-text" style={{ color: 'red', fontSize: 'small', textAlign: 'center' }}>Add to Cart to see special price</p>
              }

              {category === 'Wheels' && (search_by === 'Vehicle' || search_by === 'Size') || category === 'Winter Packages' || category === 'Tires' && (search_by === 'Size' || search_by === 'Vehicle') && sizes.length > 3 ?
               <p className="image-slider__productItem__productLabel img_product_price tooltip" >$
                  {Math.min(...price) === Math.max(...price) ? Math.min(...price).toFixed(2) : Math.min(...price).toFixed(2) + ' - ' + Math.max(...price).toFixed(2)
                  } </p> :
                searchBy !== 'Brand' && product.price &&
                <p className="image-slider__productItem__productLabel img_product_price">{'$' + parseInt(product.price).toFixed(2)}</p>
              }

              {category === 'Wheels' && search_by !== 'Brand' && parseInt(product.children[0].promo).toFixed(2) && parseInt(product.children[0].promo).toFixed(2) > 0 && (parseInt(product.children[0].promo).toFixed(2) !== parseInt(product.children[0].price).toFixed(2)) &&
                <p className="image-slider__productItem__productLabel img_product_price tooltiptext tooltiphouman" style={{ color: 'white', fontSize: 'small' }}>Add To Cart To See Special Price
                  {category === 'Wheels' ?
                     <p className="image-slider__productItem__productLabel tooltip tooltiphouman" style={{ color: 'white', fontSize: 'large', margin: ' 2% 0 0 0' }}>Up To 10% Discount
                     </p> : <p />
                  }
               </p>
              }

              {category === 'Tires' && product.priority === "0" && searchBy !== 'Brand' && product.price ?
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center'}}>
                  <p className="shipping_message" style={{ margin: 0 }}>No Stock</p>
                  <button 
                    className="contact-eta-btn" 
                    style={{ 
                      backgroundColor: '#C50000', 
                      color: 'white', 
                      border: 'none', 
                      padding: '5px 5px', 
                      fontSize: '12px', 
                      borderRadius: '3px',
                      cursor: 'pointer',
                      font: '-webkit-control'
                    }}
                  >
                    Contact for ETA
                  </button>
                </div> :
                category === 'Wheels' && (search_by === 'Vehicle' || search_by === 'Size') || category === 'Winter Packages' && sizes.length > 3 ?
                <p className="shipping_message">{shipping}</p> :
                searchBy !== 'Brand' && product.price &&
                <p className="shipping_message">{shipping}</p>
              }
            </a>
          );
        })
      };
    });

    return sliders;
  }

  handleOpenDialog(product) {
    this.clearDialogValues();
    this.setState({
      openDialog: true,
      product,
      children: product ? product.children : [],
      childrenRear: product ? product.children : [],
      front: {},
      rear: {},
      inventories: [],
      rebates: '',
      shopfortires: '',
      currentProductToAdd: ''
    });
  }

  handleCloseDialog(e) {
    this.setState({ openDialog: false });
  }

  handleCloseDialogInventories(e) {
    this.setState({ inventories: [] });
  }

  handleCloseDialogRebates(e) {
    this.setState({ rebates: '' });
  }

  addToCartClicked(product, rearProduct, chichi) {
    product.name = product.wheel_manufacturer + " " + product.model + " " + product.wheel_finish + " " + chichi.wheel_size + " " + chichi.sku + " " + chichi.center_bore + " " + chichi.bolt_pattern_1;

     // staggered wheels
    if ( rearProduct) {
      chichi.quantity = 2;
      chichi.price = [chichi.price];
      chichi.promo = [chichi.promo];
      chichi.type = 'Wheels';
      chichi.name = product.wheel_manufacturer + " " + product.model + " " + product.wheel_finish + " " + chichi.wheel_size + " " + chichi.sku + " " + chichi.center_bore + " " + chichi.bolt_pattern_1 + ' (Front)';
      chichi.image = product.image;

      const wheelback = {
        name: product.wheel_manufacturer + " " + product.model + " " + product.wheel_finish + " " + chichi.wheel_size + " " + rearProduct.sku + " " + chichi.center_bore + " " + chichi.bolt_pattern_1 + ' (Back)',
        promo: [product.promo],
        entity_id: rearProduct.child_id,
        sku: rearProduct.sku,
        price: [rearProduct.price],
        image: product.image,
        type: 'Wheels',
        quantity: 2
      };

      localStorage.setItem('wheelsback', JSON.stringify(wheelback));
      this.props.addProduct(chichi);
      this.setState({ openDialog: false });

    } else {

      let price = this.props.params.category === 'Wheels' && 
      (this.props.params.search_by === 'Vehicle' || this.props.params.search_by === 'Size' ) || 
      this.props.params.category === 'Winter Packages' ? getPrices(this.props.params.size.split('-'), product.children) : [];

      if (this.props.params.search_by === 'Brand' ) {
        price = chichi.price;
        product.sku = chichi.sku;
      }

      if ( JSON.parse(localStorage.getItem('carYear'))) {
        const sensorcar = JSON.parse(localStorage.getItem('carYear'));
        const sensormodel = localStorage.getItem('carModel');
        const sensormake = localStorage.getItem('carMake');
        if ( sensorcar >= 2006 ) {
          const tpms = {
            name: 'TPMS Sensors',
            entity_id: '84852021',
            sku: 'TS2021S',
            price: ['50'],
            promo: ['0'],
            image: 'tpms-service-schrader-tpms-sensor-sb-20720-1_grande.jpeg',
            quantity: 4
          };
          const tpms2 = {
            name: 'OEM TESLA Bluetooth Sensor',
            entity_id: '85852021',
            sku: 'TS2022S',
            price: ['85'],
            promo: ['0'],
            image: 'tpms_tesla.jpg',
            quantity: 4
          };

          if (sensormake === 'TESLA' && sensorcar > 2021 && (sensormodel === 'MODEL S' || sensormodel === 'MODEL X') ) {
            localStorage.setItem('tpms', JSON.stringify(tpms2));
          } else if (sensormake === 'TESLA' && sensorcar > 2020 && sensormodel === 'MODEL 3') {
            localStorage.setItem('tpms', JSON.stringify(tpms2));
          } else if (sensormake === 'TESLA' && sensormodel === 'MODEL Y') {
            localStorage.setItem('tpms', JSON.stringify(tpms2));
          } else {
            localStorage.setItem('tpms', JSON.stringify(tpms));
          }
        }
      }

      product.type = 'Wheels';
      price = chichi.price;
      let promo = chichi.promo;
      product.price = [price];
      product.promo = [promo];
      if (product.price[0] == product.promo[0] ) {
        product.promo = [];
      }
      product.sku = chichi.sku;
      product.quantity = 4;
      product.entity_id = chichi.child_id;
      this.props.addProduct(product);
      this.setState({ openDialog: false });
    }

    if (this.props.params.search_by === 'Vehicle' && this.props.params.category === 'Wheels') {
      this.setState({ shopfortires: 'product' });
    }
  }

  addToCartClickedTire(product, staggered, hoo) {
    let price = [];

    if (staggered) {
      price = product['front-price'];
      product.price = [price];
      product.promo = ['0'];
      product.quantity = 2;
      product.type = 'Tires';
      product.sku = product['front-sku'];
      product.name = product.name + ' ' + product['front-tread_width'] + '/' + product['front-wheel_profile'] + '-' + product['front-wheel_size'] + ' (Front)';

      const bprice = product['back-price'];

      const tireback = {
        name: product.name.replace(' ' + product['front-tread_width'] + '/' + product['front-wheel_profile'] + '-' + product['front-wheel_size'] + ' (Front)', '') + ' ' + product['back-tread_width'] + '/' + product['back-wheel_profile'] + '-' + product['back-wheel_size'] + ' (Back)',
        entity_id: product['back-id'],
        sku: product['back-sku'],
        price: [bprice],
        promo: ['0'],
        image: product.image,
        type: 'Tires',
        quantity: 2
      };

      localStorage.setItem('tireback', JSON.stringify(tireback));

      this.props.addProduct(product);
      this.setState({ openDialog: false });
    } else {
      price = product.price;

      if (!product.name) {
        product.name = hoo.tire_manufacturer + ' ' + hoo.description + ' ' + product.tread_width + '/' + product.wheel_profile + '-' + product.wheel_size;
        product.image = hoo.image;
        product.price = [price];
        product.promo = ['0'];
        product.type = 'Tires';
      }

      product.price = [price];
      product.promo = ['0'];
      product.type = 'Tires';
      product.quantity = 4;
      this.props.addProduct(product);
      this.setState({ openDialog: false });
    }
  }

  getOptionsListFor(options) {
    const getOptions = (option) => <MenuItem key={option} value={option}>{option}</MenuItem>;
    return R.map(getOptions)(options);
  }

  clearDialogValues() {
    const stt = {};
    stt.children = this.state.product ? this.state.product.children : [];
    stt.childrenRear = this.state.product ? this.state.product.children : [];
    stt.front = {};
    stt.rear = {};
    this.setState(stt);
  }

  getAttrs(values, items, name, isRear) {

    const houmanCarModel = window.localStorage.getItem('carModel');
    const houmanCarYear = window.localStorage.getItem('carYear');
    const houmanelement = window.localStorage.getItem('search_by');

    let vals = items || [];

    if (values[name] && !isRear && !values.staggered) {
      vals = vals.filter(x => x[name] === values[name]);
    }

    Object.keys(FilterTitles).forEach(x => {
      if (isRear) {
        if (this.state.rear[x]) {
          vals = vals.filter(y => y[x] === this.state.rear[x]);
        }
      } else if (this.state.front[x]) {
        vals = vals.filter(y => y[x] === this.state.front[x] );
      }
    });

    if (isRear && this.state.front.wheel_width ) {
      vals = vals.filter(y => parseInt(y.wheel_width) > parseInt(this.state.front.wheel_width));
    }

    if (values.staggered && !isRear && this.state.rear.wheel_width) {
      vals = vals.filter(y => parseInt(y.wheel_width) < parseInt(this.state.rear.wheel_width));
    }

    vals = vals.map(x => x[name]);
    vals = vals.filter(x => x && x !== 'Not Available');

    let res = Array.from(new Set(vals)).sort((a, b) => parseFloat(a.replace('x', '') - parseFloat(b.replace('x', ''))));

    if (values.staggered && name === 'wheel_width' && !this.state.front[name] && !this.state.rear[name] && res.length > 1) {
      if (isRear) {

        // Rear wheel_width
        res = res.slice(1);
        if (houmanCarModel === 'MODEL Y') {
          for ( let i = 0; i < res.length; i++) {
            if ( Number(res[i]) !== 10.5) {
              res.splice(i, 1);
            }
          }
        }

      } else {
        // front wheel_width
        res = res.slice(0, res.length - 1);

        if ( houmanCarModel && houmanCarModel === 'MODEL S') {
          for ( let i = 0; i < res.length; i++) {
            if ( Number(res[i]) > 9.1) {
              res.splice(i, 1);
            }
          }
        }
        if (houmanCarModel && houmanCarModel.indexOf('S CLASS') > -1 && houmanCarYear < 2014) {
          for ( let i = 0; i < res.length; i++) {
            if ( Number(res[i]) > 9.1) {
              res.splice(i, 1);
            }
          }
        }
        if (houmanCarModel && houmanCarModel.indexOf('C CLASS') > -1 && houmanCarYear < 2014) {
          for ( let i = 0; i < res.length; i++) {
            if ( Number(res[i]) > 8.6) {
              res.splice(i, 1);
            }
          }
        }
        if (houmanCarModel && houmanCarModel === 'MODEL Y') {
          for ( let i = 0; i < res.length; i++) {
            if ( Number(res[i]) > 9.6) {
              res.splice(i, 1);
            }
          }
        }
      }
    }

    if (houmanCarModel && houmanCarModel === 'MODEL 3' && name === 'wheel_width' && isRear ) {
      for ( let i = 0; i < res.length; i++) {
        if ( Number(res[i]) === 8.5) {
          res.splice(i, 1);
        }
      }
    }

    if (houmanCarModel && houmanCarModel === 'MODEL X' && name === 'wheel_width' && isRear ) {
      for ( let i = 0; i < res.length; i++) {
        if ( Number(res[i]) === 11) {
          res.splice(i, 1);
        }
      }
    }

    if ( houmanelement && houmanelement === 'BMW x5 x6 old' && name === 'wheel_width' && !isRear ) {
      for ( let i = 0; i < res.length; i++) {
        if ( Number(res[i]) === 10.5 ) {
          res.splice(i, 1);
        }
      }
    }

    if ( houmanelement && ( houmanelement === 'BMW x5 x6 old' || houmanelement === 'BMW x5 x6 new' ) && name === 'wheel_width' && isRear ) {
      for ( let i = 0; i < res.length; i++) {
        if ( Number(res[i]) === 10 || Number(res[i]) === 9.5 ) {
          res.splice(i, 1);
        }
      }
    }

    if (res.length === 0) {
      return '';
    }

    return res;
  }

  inputSelectionChanged(e, title) {
    const front = this.state.front;
    front[title] = e.target.value;

    this.setState(front, function () {
      let children = this.state.product.children;
      Object.keys(FilterTitles).forEach(x => {
        if (this.state.front[x]) {
          children = children.filter(y => y[x] === this.state.front[x]);
        }
      });
      this.setState({ children });
    });
  }

  inputSelectionChangedRear(e, title) {
    const rear = this.state.rear;
    rear[title] = e.target.value;

    this.setState(rear, function () {
      let childrenRear = this.state.product.children;
      Object.keys(FilterTitles).forEach(x => {
        if (this.state.rear[x]) {
          childrenRear = childrenRear.filter(y => y[x] === this.state.rear[x]);
        }
      });
      this.setState({ childrenRear });
    });
  }

  showInventoriesClicked(id) {
    const url = 'https://panel.sorat.ca/apii/inventory.php?sku=' + id;

    fetch(url)
      .then(response => {
        return response.json();
      }).then(json => {
        if (!json || json.length === 0) {
          json = [{ title: 'Inventories', available_qty: 0 }];
        }
        this.setState({ loading: false, inventories: json });
      });
  }

  showRebatesClicked(taghi) {
    this.setState({ rebates: taghi });
  }

  handleOpenimage(e, image) {
    if (image == 'no_selection') {
      this.setState({ showImage: false, imageUrl: '' });
    } else {
      this.setState({ showImage: true, imageUrl: image });
    }
    
  }

  handleCloseDialogImage() {
    this.setState({ showImage: false, imageUrl: '' });
  }

  getTiresDialogContent(product, styles, staggered) {

    const items = {
      tread_width: 'Width',
      wheel_profile: 'Profile',
      wheel_size: 'Size',
      speed_rating: 'Speed Rating',
      load_index: 'Load Index',
      performance_category: 'Category',
      // tire_manufacturer: 'Manufacturer',
      sku: 'SKU',
      Shipping: 'Inventory',
      price: 'Price'
    };

    return (

      <div>{Object.keys(items).map((x, index) => {
        let valueFront = product['front-' + x] || product[x];
        let valueBack = product['back-' + x] || product[x];
        if (x === 'price') {
          valueFront = parseInt(valueFront) ? '$' + parseInt(valueFront).toFixed(2) : '';
          valueBack = parseInt(valueBack) ? '$' + parseInt(valueBack).toFixed(2) : '';
        }
        const shippingButtonFront = '';
        const shippingButtonBack = '';
        const rowStyle = index % 2 !== 1 ? { backgroundColor: '#f2f2f2' } : {};
    
        return (valueFront || valueBack) &&
          <div key={x} style={rowStyle}>
            <label style={styles.label}>{items[x]}</label>

            <span style={x === 'price' ? styles.pricecolor : styles.front} >{valueFront}{shippingButtonFront}</span>
            {staggered && <span tyle={x === 'price' ? styles.pricecolorrear : styles.rear} style={styles.rear}>{valueBack}{shippingButtonBack}</span>}
          </div>;
      })}
        { product.priority !== "0" ?
                <div style={{ fontSize: '0.2em', marginTop: '1%' }}>
          <label style={styles.label}>
            <Button className="vehicleSelection-contentTires__btnlist"
              onClick={(e) => this.addToCartClickedTire(product, staggered)}>Add To Cart
            </Button>
          </label>
          <TextField value={this.state.qtyFront || (staggered ? 2 : 4)} style={styles.front}
            onChange={(e) => this.setState({ qtyFront: e.target.value })} disabled/>
          {staggered &&
            <TextField value={this.state.qtyRear || (staggered ? 2 : 4)} style={styles.rear}
              onChange={(e) => this.setState({ qtyRear: e.target.value })} disabled/>}
        </div> :
        <div style={{ fontSize: '0.8em', marginTop: '1%' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <TextField 
              placeholder="Full Name"
              value={this.state.etaFullName || ''}
              onChange={(e) => this.setState({ etaFullName: e.target.value })}
              style={{ flex: 1 }}
            />
            <TextField 
              placeholder="Phone"
              value={this.state.etaPhone || ''}
              onChange={(e) => this.setState({ etaPhone: e.target.value })}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <TextField 
              placeholder="Email"
              value={this.state.etaEmail || ''}
              onChange={(e) => this.setState({ etaEmail: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>
          {this.state.etaSubmitted && 
            <div style={{ color: 'green', textAlign: 'center', marginBottom: '10px' }}>
              Request submitted successfully!
            </div>
          }
        </div>
        }
      </div>
    );
  }

   submitETARequest = (product) => {
    const { etaFullName, etaPhone, etaEmail } = this.state;
    
    if (!etaFullName || !etaPhone || !etaEmail) {
      alert('Please fill all fields');
      return;
    }

    // Set processing state
    this.setState({ etaProcessing: true });

    const requestData = {
      fullName: etaFullName,
      phone: etaPhone,
      email: etaEmail,
      tire: {
        manufacturer: product.tire_manufacturer,
        model: product.model,
        size: product.tread_width + '/' + product.wheel_profile + '-' + product.wheel_size,
        sku: product.sku
      }
    };

    // Set timeout for 3 seconds
    const timeoutId = setTimeout(() => {
      this.setState({ 
        etaSubmitted: true,
        etaProcessing: false,
        etaFullName: '',
        etaPhone: '',
        etaEmail: ''
      });
    }, 3000);

    fetch('https://soratwheels.com/apii/eta_request.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
      clearTimeout(timeoutId);
      if (data.success) {
        this.setState({ 
          etaSubmitted: true,
          etaProcessing: false,
          etaFullName: '',
          etaPhone: '',
          etaEmail: ''
        });
      } else {
        alert('Error submitting request. Please try again.');
        this.setState({ etaProcessing: false });
      }
    })
    .catch(error => {
      clearTimeout(timeoutId);
      console.error('Error:', error);
      this.setState({ 
        etaSubmitted: true,
        etaProcessing: false,
        etaFullName: '',
        etaPhone: '',
        etaEmail: ''
      });
    });
  }

  getProductDialog() {
    const { category } = this.props.params;
    const { searchBy } = this.props;
    const isTires = category === 'Tires';
    const { openDialog, product } = this.state;
    let { children, childrenRear } = this.state;

    if (product) {
      const items = this.collectProductInfo(product);
   
      const staggered = items.staggered;
      const formItems = {};
      const formItemsRear = {};

      Object.keys(FilterTitles).forEach(x => {
        formItems[x] = this.getAttrs(items, children, x, false);

        if (formItems[x].length === 1) {
          this.state.front[x] = formItems[x][0];
          if (this.state.front[x]) {
            children = children.filter(y => y[x] === this.state.front[x]);
          }
        }

        formItemsRear[x] = this.getAttrs(items, childrenRear, x, true);

        if (formItemsRear[x].length === 1) {
          this.state.rear[x] = formItemsRear[x][0];
          if (this.state.rear[x]) {
            childrenRear = childrenRear.filter(y => y[x] === this.state.rear[x]);
          }
        }

        if (x === 'wheel_width' && staggered && !isTires ) {
          childrenRear = childrenRear.filter(y => formItemsRear[x].indexOf(y[x]) > -1 );
          children = children.filter(y => formItems[x].indexOf(y[x]) > -1 );
        }

      });

      const showItem = children && (this.props.params.category === 'Wheels' && this.props.params.search_by === 'Size' ? children.length === 1 || children.length > 1 : children.length === 1);
      const showItemRear = staggered && childrenRear && childrenRear.length === 1;
      const showInventories = this.state.inventories && this.state.inventories.length > 0;
      const showAddToCart = this.state.currentProductToAdd;
      const showadd = this.state.shopfortires;

      const styles = {
        label: { width: '36%', display: 'inline-block', verticalAlign: 'top' },
        front: {
          width: staggered ? '29%' : '64%',
          display: 'inline-block',
          fontSize: '14px',
          fontWeight: '600',
          overflow: 'hidden'
        },
        rear: {
          width: '29%',
          display: 'inline-block',
          marginLeft: 10,
          fontSize: '14px',
          fontWeight: '600',
          overflow: 'hidden'
        },
        pricecolor: {
         color: 'red',
         width: staggered ? '29%' : '64%',
         display: 'inline-block',
         fontSize: '14px',
         fontWeight: '600',
         overflow: 'hidden'
        },
        pricecolorrear: {
          color: 'red',
          width: '29%',
          display: 'inline-block',
          marginLeft: 10,
          fontSize: '14px',
          fontWeight: '600',
          overflow: 'hidden'
         },
         maincontainer: {
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          boxSizing: 'border-box',
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: 1280,
          paddingLeft: 10,
          paddingRight: 10,
          width: window.innerWidth <= 768 ? '100%' : staggered ? '865px' : '650px',
          height: staggered ? '340px' : '320px'
        },
        frontNotSelected: {
          width: staggered ? '29%' : '64%',
          display: 'inline-block',
          fontsize: '14px',
          borderBottom: '2px solid red'
        },
        rearNotSelected: {
          width: '29%',
          display: 'inline-block',
          fontsize: '14px',
          marginLeft: 10,
          borderBottom: '2px solid red'
        },
        btnQuestion: {
          background: '#fff014',
          fontSize: '12px',
          color: '#000',
          margin: 'auto 1px',
          padding: 0,
          borderRadius: '50%',
          height: '24px',
          width: '25px',
          lineHeight: 'normal',
          border: 0
        },
        inventoryContainer: {
          position: 'relative'
        },
        inventory: {
          position: 'absolute',
          top: 0,
          right: 0,
          background: 'white',
          padding: 10,
          border: '1px solid black'
        },
        inventoryItemTitle: {
          width: 150,
          display: 'inline-block'
        },
        cartPopupStyle: {
          backgroundColor: 'rgb(0, 0, 0, 0.5)',
          opacity: '0.95',
          cursor: 'pointer',
          height: '1689px',
          width: '100%',
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 111111111
        }
      };

      return (

        <div style={{zIndex: '999999999999'}}> 
          <Dialog open={openDialog && !showAddToCart} fullScreen={false} onClose={(e) => this.handleCloseDialog(e)} maxWidth={'lg'} aria-labelledby="form-dialog-title" >

            <DialogTitle id='title1' >
              <div style={{backgroundColor: '#212121', boxShadow: "1px 4px 20px"}}>
                <div>
                <a className="closebtnmain" style={{top: '14px'}} onClick={(e) => this.handleCloseDialog(e)}>&times;</a>
                </div>

                <div id='dialog-titleh' style={{ textAlign: 'center', padding: '14px', color: 'white', fontSize: '16px' }}>
                          {this.props.params.category === 'Wheels' ? product.wheel_manufacturer + ' ' + product.model :
                          this.props.params.category === 'Tires' && this.props.params.search_by !== 'Brand' ? product.tire_manufacturer + ' ' + product.model :
                          product.tire_manufacturer + ' ' + product.model}
                          {this.props.params.category === 'Wheels' && <span> ({product.wheel_finish}) </span>}
                </div>
              </div>
            </DialogTitle>

            <DialogContent id="card-popup-dialog-body">
              <div className="product-info-container" style={styles.maincontainer}>
                <div className="main" style={this.mainStyles.main}>
                  <div className="product-info-main" style={this.mainStyles.productInfoMain}>
                    <div className="top-bar" style={this.mainStyles.topBarInfo}>

                      {staggered && <div><span style={styles.label} />
                        <span style={styles.front}>Front</span>
                        <span style={styles.rear}>Rear</span></div>}

                      {Object.keys(formItems).map(x => {
                        const vals = formItems[x];
                        const valsRear = formItemsRear[x];
                        if (vals) {
                          if (vals instanceof Array) {
                            return <div key={x}>
                              <label style={styles.label}>{FilterTitles[x]}</label>
                              <Select value={this.state.front[x] || ''}
                                style={this.state.front[x] ? styles.front : styles.frontNotSelected}
                                onChange={(e) => this.inputSelectionChanged(e, x)}
                                className={this.state.front[x] ? "dialog-popup-select" : 'dialog-popup-select-mandatory'}>
                                {this.getOptionsListFor(vals)}
                              </Select>
                              
                              {staggered && <Select value={this.state.rear[x] || ''}
                                style={this.state.rear[x] ? styles.rear : styles.rearNotSelected}
                                onChange={(e) => this.inputSelectionChangedRear(e, x)}
                                className={this.state.rear[x] ? "dialog-popup-select" : 'dialog-popup-select-mandatory'}>
                                {this.getOptionsListFor(valsRear)}
                              </Select>}
                            </div>;
                          }
                        }
                      })}

                      {(showItem || showItemRear) &&
                        <div id='dialog-price'>
                          <label style={styles.label}>Price</label>
                           { <span style={styles.front}>{showItem && '$' + parseInt(children[0].price).toFixed(2) }</span>
                            }

                          {staggered &&
                            <span style={styles.rear}>{showItemRear && '$' + parseInt(childrenRear[0].price).toFixed(2)}</span>}
                        </div>
                      }

                      {(showItem || showItemRear) &&
                        <div>
                          <label style={styles.label}>SKU</label>
                          <span style={styles.front}>
                            {showItem && children[0].sku}
                            {showItem && 
                              <button 
                                onClick={() => this.copyToClipboard(children[0].sku)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  marginLeft: '5px'
                                }}
                              >
                                📋
                              </button>
                            }
                          </span>
                          {staggered && <span
                            style={styles.rear}>{showItemRear && childrenRear[0].sku}
                            {showItemRear && 
                              <button 
                                onClick={() => this.copyToClipboard(childrenRear[0].sku)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  marginLeft: '5px'
                                }}
                              >
                                📋
                              </button>
                            }
                          </span>}
                        </div>
                      }

                      {!isTires && (showItem || showItemRear) &&
                        <div>
                          <label style={styles.label}>Shipping</label>
                          <span style={styles.front} className="btnInventory">{showItem && children[0].Shipping}
                         { children[0].Shipping !== 'Not Stock Call for ETA' &&
                            <button type="button" style={styles.btnQuestion}
                              onClick={(e) => this.showInventoriesClicked(children[0].sku)}>?</button>}
                              </span>
                          {showItemRear && <span style={styles.rear} className="btnInventory">{showItemRear && childrenRear[0].Shipping}

                            {childrenRear[0].Shipping !== 'Not Stock Call for ETA' &&
                              <button type="button" style={styles.btnQuestion}
                                onClick={(e) => this.showInventoriesClicked(childrenRear[0].sku)}>?</button>}
                          </span>}

                        </div>
                      }
                      {/* //---------------------------------------------------Inventory Dialog------------------------------------------------------------- */}
                      <Dialog open={showInventories} onClose={(e) => this.handleCloseDialogInventories(e)}
                        aria-labelledby="form-dialog-title">
                        <DialogTitle id="dialog-popup-inventiry-title">
                          <span className="dialog-popup-inventiry-titleh"
                          >Inventories</span>
                        </DialogTitle>

                        <DialogContent id="dialog-popup-inventiry-body">
                          {this.state.inventories.map((inventory, index) => (
                          <div key={index}>
                          {Object.keys(inventory).map(key => {
                          if (key !== 'sku' && inventory[key] > 3) { 
                          return (
                           <div key={key}>
                            <strong>{key}:</strong> {inventory[key]}
                           </div> ); }
                          return null; })}
                          </div> ))}
                        </DialogContent>

                        <DialogActions id="dialog-popup-inventiry-actions">
                          <Button className="vehicleSelection-contentTires__btnlist"
                            onClick={(e) => this.handleCloseDialogInventories(e)}>
                            Close
                            </Button>
                        </DialogActions>

                      </Dialog>
                      {/* //-------------------------------------------------------------------------------------------------------------------------------- */}

                      {isTires && searchBy !== 'Brand' && this.getTiresDialogContent(product, styles, staggered)}

                      {showItem && !isTires && (!staggered || showItemRear) &&
                        <div style={{ fontSize: '0.2em' }}>
                          <label style={styles.label}>
                            <Button className="vehicleSelection-contentTires__btnlist"
                                onClick={(e) => this.addToCartClicked(product, staggered && childrenRear[0], children[0])}>
                              Add To Cart
                            </Button>
                          </label>
                          <TextField value={this.state.qtyFront || (staggered ? 2 : 4)} style={styles.front}
                            onChange={(e) => this.setState({ qtyFront: e.target.value })} disabled />
                          {showItemRear &&
                            <TextField value={this.state.qtyRear || (staggered ? 2 : 4)} style={styles.rear}
                              onChange={(e) => this.setState({ qtyRear: e.target.value })} disabled/>}
                        </div>
                      }

                      {showItem && isTires && (!staggered || showItemRear) &&
                        <div style={{ fontSize: '0.2em' }}>
                          <label style={styles.label}>
                            <Button className="vehicleSelection-contentTires__btnlist" style={{marginRight: '3px'}}
                              onClick={(e) => this.addToCartClickedTire(children[0], staggered, product)}>Add
                              To Cart
                           </Button>
                          </label>
                          
                          <TextField value={this.state.qtyFront || (staggered ? 2 : 4)} style={styles.front}
                            onChange={(e) => this.setState({ qtyFront: e.target.value })} disabled/>
                          {showItemRear &&
                            <TextField value={this.state.qtyRear || (staggered ? 2 : 4)} style={styles.rear}
                              onChange={(e) => this.setState({ qtyRear: e.target.value })} disabled/>}
                        </div>
                      }
                    </div>
                  </div>

                      <div className="product-media" style={this.mainStyles.productMedia}>
                          {this.props.params.category === 'Tires' ? <img src={'https://www.soratwheels.ca/media/brands/' + product.tire_manufacturer + '.jpg'} style={{width: '100px'}}></img> :
                          <img src={'https://www.soratwheels.ca/media/brands/' + product.wheel_manufacturer + '.jpg'} style={{width: '100px'}}></img>
                          }   

                       <a onClick={(e) => this.handleOpenimage(e, product.image)} style={{display: 'contents'}}>
                          { product.image === 'no_selection' || product.image === '' ?
                            <img src={window.baseUrl + '/media/soratimg.jpg'}
                              className="image-slider-popup-productImage"  /> :
                                product.image.includes('https://panel.sorat.ca') || product.image.includes('directautoimport') ?
                                  <img src={product.image}
                                        className="image-slider-popup-productImage" style={{cursor: 'zoom-in'}}
                                        width="350"
                                        height="350" /> :
                                        product.image.includes('wheelpros') || product.image.includes('https://wheel') ?
                                        <img src={product.image}
                                            className="image-slider-popup-productImage" style={{cursor: 'zoom-in'}}
                                            width="350"
                                            height="350" /> :
                                  <img src={window.baseUrl + '/pub/media/catalog/product' + product.image}
                                      className="image-slider-popup-productImage" style={{cursor: 'zoom-in'}}
                                      width="350"
                                      height="350" />
                          }
                        </a>
                      </div>

                        <Dialog open={this.state.showImage} onClose={(e) => this.handleCloseDialogImage(e)}
                          aria-labelledby="form-dialog-title">
                          <DialogTitle id="dialog-popup-inventiry-title" >
                            <a className="closebtnmain" onClick={(e) => this.handleCloseDialogImage(e)}>&times;</a>
                            <div style={{ textAlign: 'center', color: '#333', fontSize: '16px', marginTop: '10px' }}>
                              {window.localStorage.getItem('carYear')} {window.localStorage.getItem('carMake')} {window.localStorage.getItem('carModel')}
                            </div>
                          </DialogTitle>
                          <DialogContent id="dialog-popup-inventiry-body" style={{ 
                            width: window.innerWidth <= 768 ? '315px' : '550px', 
                            height: 'auto', 
                            overflow: 'hidden'  
                          }}>
                              <img src={this.state.imageUrl} 
                                   className='image' 
                                   style={{ 
                                     width: window.innerWidth <= 768 ? '315px' : '550px', 
                                     height: 'auto', 
                                    //  cursor: 'zoom-in' 
                                   }}
                                   onClick={(e) => this.handleOpenFullScreenImage(e, this.state.imageUrl)}/>
                          </DialogContent>
                        </Dialog>

                </div>
              </div>
            </DialogContent>

            <DialogActions id="card-popup-dialog-actions">
              {product.priority === "0" && isTires && (
                <Button 
                  className="vehicleSelection-contentTires__btnlist"
                  onClick={(e) => this.submitETARequest(product)}
                  disabled={this.state.etaProcessing}
                  style={{ 
                    backgroundColor: this.state.etaProcessing ? '#ccc' : '#C50000', 
                    color: 'white'
                  }}
                >
                  {this.state.etaProcessing ? 'Processing...' : 'STOCK CHECK'}
                </Button>
              )}
              <Button onClick={(e) => this.handleCloseDialog(e)}
                className="vehicleSelection-contentTires__btnlist">
                Close Form
              </Button>
              { !isTires && <Button onClick={(e) => this.clearDialogValues()}   
                className="vehicleSelection-contentTires__btnlist">
                Reset Items
                    </Button>}
               { !isTires && this.props.params.category === 'Wheels' && //this.props.params.search_by === 'Vehicle' && 
                 product && product.image && product.image !== 'no_selection' && product.image !== '' && 
                 !product.image.includes('/media/soratimg.jpg') &&
                 <Button onClick={(e) => this.generateCarRimImage(e)}   
                   className={`vehicleSelection-contentTires__btnlist ${!this.state.hasClickedVisualizer && !this.state.loading ? 'shake-animation' : ''}`}
                   disabled={this.state.loading}
                   style={{ 
                     opacity: this.state.loading ? 0.5 : 1,
                     color: 'black',
                      backgroundColor: this.state.loading ? '#eedfdfff' : '#ffd000ff'
                   }}>
                   {this.state.loading ? `Generating... ${this.state.countdown}s` : 'Wheel Visualizer'}
                 </Button>}
            </DialogActions>
          </Dialog>
          {showadd && <div>
            <div id="product-app">
              <AddToCartPopup />
            </div>
          </div>}
        </div>);
    }
  }

  handleChange = (event, newValue) => {
    this.setState({ value: newValue });
  };


  filterHOUMANinventory = (event) => {
    const size = this.props.size;
    const realSize = size.split('--');
    const Vancouverstatus = localStorage.getItem( 'VancouverInv') ? localStorage.getItem( 'VancouverInv') : '';
    const vancouver = 'Local Vancouver Stock';
    const priceproduct = [];

    if (this.props.params.search_by === 'Vehicle') {

      if (this.state.newdata.length > 0) {
        for ( let h = 0; h < this.state.newdata.length; h++) {
          for (let a = 0; a < this.state.newdata[h].children.length; a++) {
            if (this.state.newdata[h].children[a].Shipping === vancouver && !(priceproduct.indexOf(this.state.newdata[h]) > -1) && this.state.newdata[h].children[a].wheel_size === this.props.size) {
              priceproduct.push(this.state.newdata[h]);
            }
          }
        }
      } else {
        for ( let h = 0; h < this.state.allData.length; h++) {
          for (let a = 0; a < this.state.allData[h].children.length; a++) {
            if (this.state.allData[h].children[a].Shipping === vancouver && !(priceproduct.indexOf(this.state.allData[h]) > -1) && this.state.allData[h].children[a].wheel_size === this.props.size) {
              priceproduct.push(this.state.allData[h]);
            }
          }
        }
      }

    } else if (this.state.newdata.length > 0) {
      for ( let h = 0; h < this.state.newdata.length; h++) {
        for (let a = 0; a < this.state.newdata[h].children.length; a++) {
          if (this.state.newdata[h].children[a].Shipping === vancouver && !(priceproduct.indexOf(this.state.newdata[h]) > -1) && parseInt(this.state.newdata[h].children[a].wheel_size) === parseInt(realSize[0])) {
            priceproduct.push(this.state.newdata[h]);
          }
        }
      }
    } else {
      for ( let h = 0; h < this.state.allData.length; h++) {
        for (let a = 0; a < this.state.allData[h].children.length; a++) {
          if (this.state.allData[h].children[a].Shipping === vancouver && !(priceproduct.indexOf(this.state.allData[h]) > -1) && parseInt(this.state.allData[h].children[a].wheel_size) === parseInt(realSize[0])) {
            priceproduct.push(this.state.allData[h]);
          }
        }
      }
    }

    if ( Vancouverstatus === 'ON') {
      localStorage.setItem( 'VancouverInv', 'OFF');
      this.state.newdata = '';
      this.state.widthselected = '';
      this.state.brandselected = '';
      this.state.pricelistselected = '';
    } else if ( Vancouverstatus === '' || Vancouverstatus === 'OFF') {
      localStorage.setItem( 'VancouverInv', 'ON');
      this.state.newdata = priceproduct;
    }
    this.forceUpdate();
  }

  filterHOUMANinventoryTires = (event) => {
    const Vancouverstatus = localStorage.getItem( 'VancouverInv') ? localStorage.getItem( 'VancouverInv') : '';
    const vancouver = 'Vancouver';
    const priceproduct = [];

    if (this.props.params.search_by === 'Vehicle') {

      if (this.state.newdata.length > 0) {
        for ( let h = 0; h < this.state.newdata.length; h++) {
            if (this.state.newdata[h].Shipping === vancouver && !(priceproduct.indexOf(this.state.newdata[h]) > -1) ) {
              priceproduct.push(this.state.newdata[h]);
            }
        }
      } else {
        for ( let h = 0; h < this.state.allData.length; h++) {
            if (this.state.allData[h].Shipping === vancouver && !(priceproduct.indexOf(this.state.allData[h]) > -1) ) {
              priceproduct.push(this.state.allData[h]);
          }
        }
      }

    } else if (this.state.newdata.length > 0) {
      for ( let h = 0; h < this.state.newdata.length; h++) {
          if (this.state.newdata[h].Shipping === vancouver && !(priceproduct.indexOf(this.state.newdata[h]) > -1)) {
            priceproduct.push(this.state.newdata[h]);
          }
      }
    } else {
      for ( let h = 0; h < this.state.allData.length; h++) {
          if (this.state.allData[h].Shipping === vancouver && !(priceproduct.indexOf(this.state.allData[h]) > -1)) {
            priceproduct.push(this.state.allData[h]);
        }
      }
    }

    if ( Vancouverstatus === 'ON') {
      localStorage.setItem( 'VancouverInv', 'OFF');
      this.state.newdata = '';
      this.state.widthselected = '';
      this.state.brandselected = '';
      this.state.pricelistselected = '';

    } else if ( Vancouverstatus === '' || Vancouverstatus === 'OFF') {
      localStorage.setItem( 'VancouverInv', 'ON');
      this.state.newdata = priceproduct;
    }
    this.forceUpdate();
  }

  filterHOUMANbrand = (event) => {
    this.state.brandselected = event.target.value;
    const filter1 = this.state.allData.filter(item => item.wheel_manufacturer === event.target.value);

    if (event.target.value === '') {
      this.state.widthselected = '';
      this.state.pricelistselected = '';
      document.getElementById('minpricefilter').value = '';
      document.getElementById('maxpricefilter').value = '';
    }

    this.state.newdata = filter1;
    this.setState({ newdata: filter1, brandselected: event.target.value });
  }


  filterHOUMANbrandTire = (event) => {
    this.state.brandselected = event.target.value;
    const filter1 = [];

    if (this.state.newdata.length > 0 ) {

      for ( let h = 0; h < this.state.newdata.length; h++) {
        if ( this.state.newdata[h].tire_manufacturer === event.target.value && !(filter1.indexOf(this.state.newdata[h]) > -1)) {
          filter1.push(this.state.newdata[h]);
        }
      }
    } else {
      for ( let h = 0; h < this.state.allData.length; h++) {
        if (this.state.allData[h].tire_manufacturer === event.target.value && !(filter1.indexOf(this.state.allData[h]) > -1)) {
          filter1.push(this.state.allData[h]);
        }
      }
    }

    this.state.newdata = filter1;
    this.setState({ newdata: filter1, brandselected: event.target.value });

    if (event.target.value === '') {
      this.state.performanceselected = '';
      document.getElementById('minpricefilter').value = '';
      document.getElementById('maxpricefilter').value = '';
      this.state.newdata = this.state.allData;
      this.setState({ newdata: this.state.allData, brandselected: event.target.value });
    }
  }

  filterHOUMANrft = (event) => {
    this.state.rftselected = event.target.value;
    const filterrft = [];

    if (this.state.newdata.length > 0 ) {
      for ( let h = 0; h < this.state.newdata.length; h++) {
        if ( this.state.newdata[h].Run_Flat === event.target.value && !(filterrft.indexOf(this.state.newdata[h]) > -1)) {
          filterrft.push(this.state.newdata[h]);
        }
      }
    } else {
      for ( let h = 0; h < this.state.allData.length; h++) {
        if (this.state.allData[h].Run_Flat === event.target.value && !(filterrft.indexOf(this.state.allData[h]) > -1)) {
          filterrft.push(this.state.allData[h]);
        }
      }
    }

    this.state.newdata = filterrft;
    this.setState({ newdata: filterrft, rftselected: event.target.value });

    if (event.target.value === '') {
      this.state.performanceselected = '';
      this.state.brandselected = '';
      document.getElementById('minpricefilter').value = '';
      document.getElementById('maxpricefilter').value = '';
      this.state.newdata = this.state.allData;
      this.setState({ newdata: this.state.allData, rftselected: event.target.value });
    }
  }

  filterHOUMANperformanceTire = (event) => {
    this.state.performanceselected = event.target.value;
    const filterperformance = [];

    if (this.state.newdata.length > 0 ) {

      for ( let h = 0; h < this.state.newdata.length; h++) {
        if ( this.state.newdata[h].performance_category === event.target.value && !(filterperformance.indexOf(this.state.newdata[h]) > -1)) {
          filterperformance.push(this.state.newdata[h]);
        }
      }
    } else {
      for ( let h = 0; h < this.state.allData.length; h++) {
        if (this.state.allData[h].performance_category === event.target.value && !(filterperformance.indexOf(this.state.allData[h]) > -1)) {
          filterperformance.push(this.state.allData[h]);
        }
      }
    }

    this.state.newdata = filterperformance;
    this.setState({ newdata: filterperformance, performanceselected: event.target.value });

    if (event.target.value === '') {
      this.state.brandselected = '';
      this.state.rftselected = '';
      document.getElementById('minpricefilter').value = '';
      document.getElementById('maxpricefilter').value = '';
      this.state.newdata = this.state.allData;
      this.setState({ newdata: this.state.allData, performanceselected: event.target.value });
    }
  }

  filterHOUMANloadindex = (event) => {
    this.state.loadindexselected = event.target.value;
    const filterloadindex = [];

    if (this.state.newdata.length > 0 ) {

      for ( let h = 0; h < this.state.newdata.length; h++) {
        if ( this.state.newdata[h].load_index === event.target.value && !(filterloadindex.indexOf(this.state.newdata[h]) > -1)) {
          filterloadindex.push(this.state.newdata[h]);
        }
      }
    } else {
      for ( let h = 0; h < this.state.allData.length; h++) {
        if (this.state.allData[h].load_index === event.target.value && !(filterloadindex.indexOf(this.state.allData[h]) > -1)) {
          filterloadindex.push(this.state.allData[h]);
        }
      }
    }

    this.state.newdata = filterloadindex;
    this.setState({ newdata: filterloadindex, loadindexselected: event.target.value });

    if (event.target.value === '') {
      this.state.brandselected = '';
      this.state.rftselected = '';
      this.state.performanceselected = '';
      this.state.speedselected = '';
      document.getElementById('minpricefilter').value = '';
      document.getElementById('maxpricefilter').value = '';
      this.state.newdata = this.state.allData;
      this.setState({ newdata: this.state.allData, loadindexselected: event.target.value });
    }
  }

  filterHOUMANspeed = (event) => {
    this.state.speedselected = event.target.value;
    const filterspeed = [];

    if (this.state.newdata.length > 0 ) {

      for ( let h = 0; h < this.state.newdata.length; h++) {
        if ( this.state.newdata[h].speed_rating === event.target.value && !(filterspeed.indexOf(this.state.newdata[h]) > -1)) {
          filterspeed.push(this.state.newdata[h]);
        }
      }
    } else {
      for ( let h = 0; h < this.state.allData.length; h++) {
        if (this.state.allData[h].speed_rating === event.target.value && !(filterspeed.indexOf(this.state.allData[h]) > -1)) {
          filterspeed.push(this.state.allData[h]);
        }
      }
    }

    this.state.newdata = filterspeed;
    this.setState({ newdata: filterspeed, speedselected: event.target.value });

    if (event.target.value === '') {
      this.state.brandselected = '';
      this.state.rftselected = '';
      this.state.performanceselected = '';
      document.getElementById('minpricefilter').value = '';
      document.getElementById('maxpricefilter').value = '';
      this.state.newdata = this.state.allData;
      this.setState({ newdata: this.state.allData, speedselected: event.target.value });
    }
  }

  filterHOUMANpriceMin = (event) => {
    const { size } = this.props;
    const price = event.target.value ? event.target.value : 0;
    const priceproduct = [];
    const size2 = size.split('--');
    const finalSize = this.props.searchBy === ' Vehicle' ? size : size2[0];

    if ( price > 100) {
      if (this.state.newdata.length > 0) {
        for ( let h = 0; h < this.state.newdata.length; h++) {
          for (let a = 0; a < this.state.newdata[h].children.length; a++) {
            if (this.state.newdata[h].children[a].price > price && this.state.newdata[h].children[a].wheel_size === finalSize && !(priceproduct.indexOf(this.state.newdata[h]) > -1)) {
              priceproduct.push(this.state.newdata[h]);
            }
          }
        }
      } else {
        for ( let h = 0; h < this.state.allData.length; h++) {
          for (let a = 0; a < this.state.allData[h].children.length; a++) {
            if (this.state.allData[h].children[a].price > price && this.state.allData[h].children[a].wheel_size === finalSize && !(priceproduct.indexOf(this.state.allData[h]) > -1)) {

              priceproduct.push(this.state.allData[h]);
            }
          }
        }
      }
      this.state.newdata = priceproduct;
      this.setState({ newdata: priceproduct, priceselected: price });
    }
    if ( this.state.newdata.length > 0 && price === 0 ) {
      for ( let h = 0; h < this.state.allData.length; h++) {
        for (let a = 0; a < this.state.allData[h].children.length; a++) {
          if (this.state.allData[h].children[a].price > price && this.state.allData[h].children[a].wheel_size === finalSize && !(priceproduct.indexOf(this.state.allData[h]) > -1)) {
            priceproduct.push(this.state.allData[h]);
          }
        }
      }
      this.state.widthselected = '';
      this.state.brandselected = '';
      document.getElementById('minpricefilter').value = '';
      document.getElementById('maxpricefilter').value = '';
      this.state.newdata = priceproduct;
      this.setState({ newdata: priceproduct, priceselected: '' });

    }
  }

  filterHOUMANpriceMinTires = (event) => {
    const price = event.target.value ? event.target.value : 0;
    const priceproduct = [];

    if ( price > 100) {
      if (this.state.newdata.length > 0) {
        for ( let h = 0; h < this.state.newdata.length; h++) {
          if (this.state.newdata[h].price > price && !(priceproduct.indexOf(this.state.newdata[h]) > -1)) {
            priceproduct.push(this.state.newdata[h]);
          }
        }
      } else {
        for ( let h = 0; h < this.state.allData.length; h++) {
          if (this.state.allData[h].price > price && !(priceproduct.indexOf(this.state.allData[h]) > -1)) {
            priceproduct.push(this.state.allData[h]);
          }
        }
      }
      this.state.newdata = priceproduct;
      this.setState({ newdata: priceproduct, priceselected: price });
    }

    if ( this.state.newdata.length > 0 && price === 0 ) {
      for ( let h = 0; h < this.state.allData.length; h++) {
        if (this.state.allData[h].price > price && !(priceproduct.indexOf(this.state.allData[h]) > -1)) {
          priceproduct.push(this.state.allData[h]);
        }
      }
      this.state.brandselected = '';
      this.state.performanceselected = '';
      document.getElementById('minpricefilter').value = '';
      document.getElementById('maxpricefilter').value = '';
      this.state.newdata = priceproduct;
      this.setState({ newdata: priceproduct, priceselected: '' });
    }
  }

  filterHOUMANpriceMax = (event) => {
    const { size } = this.props;
    const pricemax = event.target.value ? event.target.value : 0;
    const pricemaxproduct = [];
    const size2 = size.split('--');
    const finalSize = this.props.searchBy === ' Vehicle' ? size : size2[0];

    if ( pricemax > 110) {
      if (this.state.newdata.length > 0) {
        for ( let h = 0; h < this.state.newdata.length; h++) {
          for (let a = 0; a < this.state.newdata[h].children.length; a++) {
            if (this.state.newdata[h].children[a].price < pricemax && this.state.newdata[h].children[a].wheel_size === finalSize && !(pricemaxproduct.indexOf(this.state.newdata[h]) > -1)) {
              pricemaxproduct.push(this.state.newdata[h]);
            }
          }
        }
      } else {
        for ( let h = 0; h < this.state.allData.length; h++) {
          for (let a = 0; a < this.state.allData[h].children.length; a++) {
            if (this.state.allData[h].children[a].price < pricemax && this.state.allData[h].children[a].wheel_size === finalSize && !(pricemaxproduct.indexOf(this.state.allData[h]) > -1)) {

              pricemaxproduct.push(this.state.allData[h]);
            }
          }
        }
      }
      this.state.newdata = pricemaxproduct;
      this.setState({ newdata: pricemaxproduct, priceMAXselected: pricemax });
    }

    if ( pricemax === 0 ) {
      for ( let h = 0; h < this.state.allData.length; h++) {
        for (let a = 0; a < this.state.allData[h].children.length; a++) {
          if (this.state.allData[h].children[a].price > 0 && this.state.allData[h].children[a].wheel_size === finalSize && !(pricemaxproduct.indexOf(this.state.allData[h]) > -1)) {
            pricemaxproduct.push(this.state.allData[h]);
          }
        }
      }
      this.state.widthselected = '';
      this.state.brandselected = '';
      document.getElementById('minpricefilter').value = '';
      this.state.newdata = pricemaxproduct;
      this.setState({ newdata: pricemaxproduct, priceMAXselected: '' });
    }
  }

  filterHOUMANpriceMaxTires = (event) => {
    const pricemax = event.target.value ? event.target.value : 0;
    const pricemaxproduct = [];

    if ( pricemax > 110) {
      if (this.state.newdata.length > 0) {
        for ( let h = 0; h < this.state.newdata.length; h++) {
          if (this.state.newdata[h].price < pricemax && !(pricemaxproduct.indexOf(this.state.newdata[h]) > -1)) {
            pricemaxproduct.push(this.state.newdata[h]);
          }
        }
      } else {
        for ( let h = 0; h < this.state.allData.length; h++) {
          if (this.state.allData[h].price < pricemax && !(pricemaxproduct.indexOf(this.state.allData[h]) > -1)) {
            pricemaxproduct.push(this.state.allData[h]);
          }
        }
      }
      this.state.newdata = pricemaxproduct;
      this.setState({ newdata: pricemaxproduct, priceMAXselected: pricemax });
    }

    if ( pricemax === 0 ) {
      for ( let h = 0; h < this.state.allData.length; h++) {
        for (let a = 0; a < this.state.allData[h].children.length; a++) {
          if (this.state.allData[h].children[a].price > 0 && !(pricemaxproduct.indexOf(this.state.allData[h]) > -1)) {
            pricemaxproduct.push(this.state.allData[h]);
          }
        }
      }
      this.state.widthselected = '';
      this.state.brandselected = '';
      document.getElementById('minpricefilter').value = '';
      this.state.newdata = pricemaxproduct;
      this.setState({ newdata: pricemaxproduct, priceMAXselected: '' });
    }

  }

  generateCarRimImage = (e) => {
  this.setState({ hasClickedVisualizer: true });
  
  let year = window.localStorage.getItem('carYear');
  let make = window.localStorage.getItem('carMake');
  let model = window.localStorage.getItem('carModel');
  
  // Check if vehicle data is missing
  if (!year || !make || !model) {
    //this.renderVehicleModal(e);
    this.setState({ showVehicleModal: true });
    return;
  }
  
  const { product } = this.state;
  const rimImageUrl = product.image;

  const rimSize = window.localStorage.getItem('SIZE') || product.wheel_size || this.props.size;
  
  if (!rimImageUrl || 
      rimImageUrl === 'no_selection' || rimImageUrl === '' || 
      rimImageUrl.includes('/media/soratimg.jpg')) {
    alert('Please select a wheel with a valid image');
    return;
  }

  this.setState({ loading: true, countdown: 15 });

  this.countdownInterval = setInterval(() => {
    this.setState(prevState => ({
      countdown: prevState.countdown > 0 ? prevState.countdown - 1 : 0
    }));
  }, 1000);

  const apiUrl = `https://soratwheels.ca/apii/car_rim_generate.php?year=${year}&make=${make}&model=${model}&rim_image_url=${encodeURIComponent(rimImageUrl)}&rim_size=${rimSize}`;
  
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      clearInterval(this.countdownInterval);
      this.setState({ 
        loading: false,
        showImage: true,
        imageUrl: data.saved_file || data.generated_image_url || data.image_url,
        countdown: 0
      });
    })
    .catch(error => {
      clearInterval(this.countdownInterval);
      console.error('Error:', error);
      this.setState({ loading: false, countdown: 0 });
      alert('Error generating image');
    });
}

handleVehicleModalConfirm = () => {
  const { modalYear, modalMake, modalModel } = this.state;
  
  if (modalYear && modalMake && modalModel) {
    window.localStorage.setItem('carYear', modalYear);
    window.localStorage.setItem('carMake', modalMake);
    window.localStorage.setItem('carModel', modalModel);
    
    this.setState({ 
      showVehicleModal: false,
      modalYear: '',
      modalMake: '',
      modalModel: '',
      modalYears: [],
      modalMakes: [],
      modalModels: []
    });
    
    // Call generateCarRimImage again
    this.generateCarRimImage();
  }
}

renderVehicleModal = (e) => {
    console.log("444444444444");
    if (!this.state.showVehicleModal) return null;
    
    const cardata = JSON.parse(localStorage.getItem('vehicles'));
    const years = Object.keys(cardata).reverse();
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: '#f3f3f3ff',
          padding: '20px',
          borderRadius: '8px',
          minWidth: '300px'
        }}>
          <h3 style={{ textAlign: 'center', fontWeight: 'bold' }}>Select Vehicle</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <label>Year:</label>
            <select 
              value={this.state.modalYear || ''} 
              onChange={(e) => this.handleModalYearChange(e.target.value)}
              style={{ width: '100%', padding: '5px' }}
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label>Make:</label>
            <select 
              value={this.state.modalMake || ''} 
              onChange={(e) => this.handleModalMakeChange(e.target.value)}
              style={{ width: '100%', padding: '5px' }}
              disabled={!this.state.modalYear}
            >
              <option value="">Select Make</option>
              {(this.state.modalMakes || []).map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label>Model:</label>
            <select 
              value={this.state.modalModel || ''} 
              onChange={(e) => this.setState({ modalModel: e.target.value })}
              style={{ width: '100%', padding: '5px' }}
              disabled={!this.state.modalMake}
            >
              <option value="">Select Model</option>
              {(this.state.modalModels || []).map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <button 
              onClick={() => this.setState({ showVehicleModal: false })}
              style={{ marginRight: '10px', padding: '8px 16px', backgroundColor: '#ccc', color: 'black', border: 'none' }}
            >
              Cancel
            </button>
            <button 
              onClick={this.handleVehicleModalConfirm}
              disabled={!this.state.modalYear || !this.state.modalMake || !this.state.modalModel}
              style={{ padding: '8px 16px', backgroundColor: '#6e0707ff', color: 'white', border: 'none' }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  handleModalYearChange = (year) => {
    const cardata = JSON.parse(localStorage.getItem('vehicles'));
    const makes = year ? Object.keys(cardata[year]).sort() : [];
    
    this.setState({
      modalYear: year,
      modalMake: '',
      modalModel: '',
      modalMakes: makes,
      modalModels: []
    });
  }

  handleModalMakeChange = (make) => {
    const cardata = JSON.parse(localStorage.getItem('vehicles'));
    const { modalYear } = this.state;
    const models = modalYear && make ? cardata[modalYear][make].sort() : [];
    
    this.setState({
      modalMake: make,
      modalModel: '',
      modalModels: models
    });
  }

  handleVehicleModalConfirm = () => {
    const { modalYear, modalMake, modalModel } = this.state;
    
    if (modalYear && modalMake && modalModel) {
      window.localStorage.setItem('carYear', modalYear);
      window.localStorage.setItem('carMake', modalMake);
      window.localStorage.setItem('carModel', modalModel);
      
      this.setState({ 
        showVehicleModal: false,
        modalYear: '',
        modalMake: '',
        modalModel: '',
        modalMakes: [],
        modalModels: []
      });
      
      this.generateCarRimImage();
    }
  }

  copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Create a temporary tooltip
        const tooltip = document.createElement('div');
        tooltip.textContent = 'Saved';
        tooltip.style.position = 'fixed';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '3px';
        tooltip.style.fontSize = '14px';
        tooltip.style.zIndex = '10000';
        
        // Position the tooltip in the center of the screen
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        
        // Add the tooltip to the document
        document.body.appendChild(tooltip);
        
        // Remove the tooltip after a short delay
        setTimeout(() => {
          document.body.removeChild(tooltip);
        }, 1500);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  }

  filterHOUMANwidth = (event) => {
    const { size } = this.props;
    const size2 = size.split('--');
    const finalSize = this.props.params.searchBy === ' Vehicle' ? size : size2[0];
    const width_Select = event.target.value ? event.target.value : 0;
    this.state.widthselected = width_Select;
    const width_product = [];

    if (this.state.newdata.length > 0 ) {
      for ( let h = 0; h < this.state.newdata.length; h++) {
        for (let a = 0; a < this.state.newdata[h].children.length; a++) {
          if (this.state.newdata[h].children[a].wheel_width === width_Select && this.state.newdata[h].children[a].wheel_size === finalSize && !(width_product.indexOf(this.state.newdata[h]) > -1)) {
            width_product.push(this.state.newdata[h]);
          }
        }
      }
    } else {
      for ( let h = 0; h < this.state.allData.length; h++) {
        for (let a = 0; a < this.state.allData[h].children.length; a++) {
          if (this.state.allData[h].children[a].wheel_width === width_Select && this.state.allData[h].children[a].wheel_size === finalSize && !(width_product.indexOf(this.state.allData[h]) > -1)) {
            width_product.push(this.state.allData[h]);
          }
        }
      }
    }

    for ( let h = 0; h < width_product.length; h++) {
      for (let a = 0; a < width_product[h].children.length; a++) {
        if (width_product[h].children[a].wheel_width !== width_Select) {
          width_product[h].children.splice(width_product[h].children.indexOf(width_product[h].children[a]), 1);
        }
      }
    }

    if (width_Select === 0) {
      this.state.brandselected = '';
      document.getElementById('minpricefilter').value = '';
    }

    this.state.newdata = width_product;
    this.setState({ newdata: width_product, widthselected: width_Select });
  }

  filterHOUMANcolor = (event) => {
      const { size } = this.props;
      const size2 = size.split('--');
      const finalSize = this.props.params.searchBy === ' Vehicle' ? size : size2[0];
      const color_Select = event.target.value ? event.target.value : 0;
      this.state.colorselected = color_Select;
      const width_product = [];


    if(color_Select === 'CHROME') {

      if (this.state.newdata.length > 0 ) {
        for ( let h = 0; h < this.state.newdata.length; h++) {
          for (let a = 0; a < this.state.newdata[h].children.length; a++) {
            if ( ( this.state.newdata[h].wheel_finish.toLowerCase() === 'chrome' || this.state.newdata[h].wheel_finish === 'CHROME PLATED') && this.state.newdata[h].children[a].wheel_size === finalSize && !(width_product.indexOf(this.state.newdata[h]) > -1)) {
              width_product.push(this.state.newdata[h]);
            }
          }
        }
      } else {
        for ( let h = 0; h < this.state.allData.length; h++) {
          for (let a = 0; a < this.state.allData[h].children.length; a++) {
            if ((this.state.allData[h].wheel_finish.toLowerCase() === 'chrome' || this.state.allData[h].wheel_finish === 'CHROME PLATED' ) && this.state.allData[h].children[a].wheel_size === finalSize && !(width_product.indexOf(this.state.allData[h]) > -1)) {
              width_product.push(this.state.allData[h]);
            }
          }
        }
      }

    } else if (color_Select === 'BLACK') {

      if (this.state.newdata.length > 0 ) {
        for ( let h = 0; h < this.state.newdata.length; h++) {
          for (let a = 0; a < this.state.newdata[h].children.length; a++) {
            if ( this.state.newdata[h].wheel_finish.toLowerCase().includes('black')  && this.state.newdata[h].children[a].wheel_size === finalSize && !(width_product.indexOf(this.state.newdata[h]) > -1)) {
              width_product.push(this.state.newdata[h]);
            }
          }
        }
      } else {
        for ( let h = 0; h < this.state.allData.length; h++) {
          for (let a = 0; a < this.state.allData[h].children.length; a++) {
            if ( this.state.allData[h].wheel_finish.toLowerCase().includes('black')  && this.state.allData[h].children[a].wheel_size === finalSize && !(width_product.indexOf(this.state.allData[h]) > -1)) {
              width_product.push(this.state.allData[h]);
            }
          }
        }
      }
      
    } else if (color_Select === 'OTHER') {

      if (this.state.newdata.length > 0 ) {
        for ( let h = 0; h < this.state.newdata.length; h++) {
          for (let a = 0; a < this.state.newdata[h].children.length; a++) {
            if ( (!this.state.newdata[h].wheel_finish.toLowerCase().includes('black') && !this.state.newdata[h].wheel_finish.toLowerCase().includes('chrome') )  && this.state.newdata[h].children[a].wheel_size === finalSize && !(width_product.indexOf(this.state.newdata[h]) > -1)) {
              width_product.push(this.state.newdata[h]);
            }
          }
        }
      } else {
        for ( let h = 0; h < this.state.allData.length; h++) {
          for (let a = 0; a < this.state.allData[h].children.length; a++) {
            if ( (!this.state.allData[h].wheel_finish.toLowerCase().includes('black') && !this.state.allData[h].wheel_finish.toLowerCase().includes('chrome'))  && this.state.allData[h].children[a].wheel_size === finalSize && !(width_product.indexOf(this.state.allData[h]) > -1)) {
              width_product.push(this.state.allData[h]);
            }
          }
        }
      }

    }
    if (color_Select === 0) {
      this.state.brandselected = '';
      this.state.widthselected = '';
      document.getElementById('minpricefilter').value = '';
      this.setState({ newdata: this.state.allData, colorselected: color_Select });
    }
      this.state.newdata = width_product;
      this.setState({ newdata: width_product, colorselected: color_Select });
  }

  toggleFilter = () => {
    this.setState(prevState => ({
      isFilterOpen: !prevState.isFilterOpen
    }));
  };

  toggleFilterPanel() {
    this.setState((prevState) => ({
      isFilterPanelVisible: !prevState.isFilterPanelVisible
    }));
  }

  toggleFilterReset() {
    this.setState((prevState) => ({
      isFilterPanelVisible: !prevState.isFilterPanelVisible
    }));
  }

  render() {
    const { category, search_by, size } = this.props.params;
    const newWidth = [];
    const newBrand = [];
    const newPerformance = [];
    const Run_Flat = [];
    const speedRating = [];
    const loadIndex = [];
    const size2 = window.localStorage.getItem('SIZE') ? window.localStorage.getItem('SIZE') : '';
    const finalSize = this.props.params.searchBy === ' Vehicle' ? size : size2;

    if (this.state.newdata.length > 0 && this.props.params.category === 'Wheels') {
      for ( let h = 0; h < this.state.newdata.length; h++) {
        if (!(newBrand.indexOf(this.state.newdata[h].wheel_manufacturer) > -1)) {
          newBrand.push(this.state.newdata[h].wheel_manufacturer);
        }
      }
      for ( let h = 0; h < this.state.newdata.length; h++) {
        for (let a = 0; a < this.state.newdata[h].children.length; a++) {
          if (!(newWidth.indexOf(this.state.newdata[h].children[a].wheel_width) > -1) && this.state.newdata[h].children[a].wheel_size === finalSize) {
            newWidth.push(this.state.newdata[h].children[a].wheel_width);
          }
        }
      }
    } else if (this.state.allData.length > 0 && this.props.params.category === 'Wheels') {
      for ( let h = 0; h < this.state.allData.length; h++) {
        if (!(newBrand.indexOf(this.state.allData[h].wheel_manufacturer) > -1)) {
          newBrand.push(this.state.allData[h].wheel_manufacturer);
        }
        for (let a = 0; a < this.state.allData[h].children.length; a++) {
          if (!(newWidth.indexOf(this.state.allData[h].children[a].wheel_width) > -1) && this.state.allData[h].children[a].wheel_size === finalSize) {
            newWidth.push(this.state.allData[h].children[a].wheel_width);
          }
        }
      }
    }

    if (this.state.newdata.length > 0 && this.props.params.category === 'Tires') {
      for ( let h = 0; h < this.state.newdata.length; h++) {
        if (!(newBrand.indexOf(this.state.newdata[h].tire_manufacturer) > -1)) {
          newBrand.push(this.state.newdata[h].tire_manufacturer);
        }
      }
      for ( let h = 0; h < this.state.newdata.length; h++) {
        if (!(newPerformance.indexOf(this.state.newdata[h].performance_category) > -1)) {
          newPerformance.push(this.state.newdata[h].performance_category);
        }
        if (!(Run_Flat.indexOf(this.state.newdata[h].Run_Flat) > -1)) {
          Run_Flat.push(this.state.newdata[h].Run_Flat);
        }
        if (!(speedRating.indexOf(this.state.newdata[h].speed_rating) > -1)) {
          speedRating.push(this.state.newdata[h].speed_rating);
        }
        if (!(loadIndex.indexOf(this.state.newdata[h].load_index) > -1)) {
          loadIndex.push(this.state.newdata[h].load_index);
        }
      }

    } else if (this.state.allData.length > 0 && this.props.params.category === 'Tires') {
      for ( let h = 0; h < this.state.allData.length; h++) {
        if (!(newBrand.indexOf(this.state.allData[h].tire_manufacturer) > -1)) {
          newBrand.push(this.state.allData[h].tire_manufacturer);
        }
        if (!(newPerformance.indexOf(this.state.allData[h].performance_category) > -1)) {
          newPerformance.push(this.state.allData[h].performance_category);
        }
        if (!(Run_Flat.indexOf(this.state.allData[h].Run_Flat) > -1)) {
          Run_Flat.push(this.state.allData[h].Run_Flat);
        }
        if (!(speedRating.indexOf(this.state.allData[h].speed_rating) > -1)) {
          speedRating.push(this.state.allData[h].speed_rating);
        }
        if (!(loadIndex.indexOf(this.state.allData[h].load_index) > -1)) {
          loadIndex.push(this.state.allData[h].load_index);
        }
      }
    }

    const productData = this.state.newdata.length > 0 ? this.state.newdata : this.state.allData;
    const sliders = this.renderSliders(productData);

    let width = 0;
    if (window.innerWidth > 1200) {
      width = 1200;
    } else if (window.innerWidth < 300) {
      width = 300;
    } else {
      width = window.innerWidth * 0.8;
    }

    if (productData.length === 0) {
      return (
        <div className="content-divLength">
          <div id="imageSlider" className="productList-noResult custom_container">
            <h2>No Results</h2>
          </div>
        </div>);
    }

const { isFilterPanelVisible, isShaking } = this.state;
    return (
      <div id="imageSlider" className="image__slider">

        {this.props.params.search_by === 'Brand' &&
        <div style={{ display: 'flex', justifyContent: 'center' }}><p>
          <a href={window.baseUrl + '#/' + this.props.params.category.replace(/ /g, '%20') + '/' + this.props.params.search_by + '/'}>
          <input type='image'
                      src={window.baseUrl + '/media/brands/' + window.localStorage.getItem('Brand') + '.jpg'}
                      className="brandList-brandImage" />
                      </a>
          </p>
          </div>
        }

        {this.getProductDialog()}

{/* //////////////////////////////////////  Wheels  ///////////////////////////////////////// */}

              {(
                this.props.params.search_by === 'Vehicle' ||
                this.props.params.search_by === 'Size'
              ) && this.props.params.category === 'Wheels' && (
                <div className="houman1">

                  <div
                    style={{
                      position: 'fixed',
                      top: isFilterPanelVisible ? '145px' : '-103px',
                      width: '100%',
                      height: '250px',
                      backgroundColor: 'rgba(0, 0, 0, 0.85)',
                      zIndex: 9998,
                      transition: 'top 0.7s ease-in-out',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '20px',
                      boxSizing: 'border-box',
                      color: 'white',
                      boxShadow: '6px 0px 20px 0px #000000'
                    }}
                  >

              <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '20px',
                      boxSizing: 'border-box',
                      color: 'white',
                      alignContent: 'center',
                      flexWrap: 'wrap'
                    }}>

                    {/* Brand*/}
                    <div style={{ marginBottom: '15px' }}>
                      <select
                        value={this.state.brandselected}
                        onChange={this.filterHOUMANbrand}
                        style={{
                          height: '40px',
                          width: '100%',
                          backgroundColor: 'white',
                        }}
                      >
                        <option value="">Wheel Brand</option>
                        {newBrand
                          .sort((a, b) => b - a)
                          .map((k, index) => (
                            <option key={index} value={k}>
                              {k}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* price */}
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          id="minpricefilter"
                          style={{
                            height: '40px',
                            width: '50%',
                          }}
                          type="number"
                          placeholder="Min. Price"
                          onChange={this.filterHOUMANpriceMin}
                        />
                        <input
                          id="maxpricefilter"
                          style={{
                            height: '40px',
                            width: '50%',
                          }}
                          type="number"
                          placeholder="Max. Price"
                          onChange={this.filterHOUMANpriceMax}
                        />
                      </div>
                    </div>

                    {/* filter width */}
                    <div style={{ marginBottom: '15px' }}>
                      <select
                        value={this.state.widthselected}
                        onChange={this.filterHOUMANwidth}
                        style={{
                          height: '40px',
                          width: '49%',
                          backgroundColor: 'white',
                        }}
                      >
                        <option value="">Wheel Width</option>
                        {newWidth.map((k, index) => (
                          <option key={index} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>

                      <select
                        value={this.state.colorselected}
                        onChange={this.filterHOUMANcolor}
                        style={{
                          height: '40px',
                          width: '49%',
                          marginLeft: '2%',
                          backgroundColor: 'white',
                        }}
                      >
                        <option value="0">Wheel finish</option>
                        <option value="CHROME">CHROME</option>
                        <option value="BLACK">BLACK</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </div>

                    {/* inventory */}
                    <div style={{ marginBottom: '15px', display: 'flex' }}>
                      <label style={{ display: 'block'}}>Vancouver Stock Only  </label>
                      <input
                        value={this.state.Vancouverselected}
                        type="checkbox"
                        onChange={this.filterHOUMANinventory}
                      />
                    </div>

                  </div>

                  <div style={{ display: 'flex'}}>
                    {/*  Apply & Close */}
                    <button
                      onClick={this.toggleFilterPanel}
                      style={{
                        alignSelf: 'center',
                        marginTop: '-14px',
                        backgroundColor: '#960003',
                        color: 'white',
                        borderRadius: '0px 0px 5px 5px',
                        padding: '8px 20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        border: '0px'
                      }}
                    >
                    {this.state.isFilterPanelVisible ? "Apply & Close" : "Filters"}
                      
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="white"
                        width="16px"
                        height="16px"
                        style={{ marginLeft: '8px', transition: 'transform 0.3s' }}
                      >
                        <path
                          d={
                            this.state.isFilterPanelVisible
                              ? "M12 8l-8 8h16z" // up
                              : "M12 16l-8-8h16z" // Down
                          }
                        />
                      </svg>
                    </button>
                  </div>

                  </div>
                </div>

              )}

{/* //////////////////////////////////////  Tires   //////////////////////////////////////////////// */}

                {(
                  this.props.params.search_by === 'Vehicle' ||
                  this.props.params.search_by === 'Size'
                ) && this.props.params.category === 'Tires' && (
                  <div className="houman1">

                    <div
                      style={{
                        position: 'fixed',
                        top: isFilterPanelVisible ? '145px' : '-280px',
                        width: '100%',
                        height: '430px',
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        zIndex: 9998,
                        transition: 'top 0.7s ease-in-out',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '20px',
                        boxSizing: 'border-box',
                        color: 'white',
                        boxShadow: '6px 0px 20px 0px #000000'
                      }}
                    >

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '5px 20px 20px 20px',
                        boxSizing: 'border-box',
                        color: 'white',
                        alignContent: 'center',
                        flexWrap: 'wrap'
                      }}>

                      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center'}}>
                        <label style={{ display: 'block', fontWeight: 'bold', width: '115px' }}>Tire Size:</label>
                        <input
                          style={{
                            height: '40px',
                            width: '100%',
                            textAlign: 'center',
                            fontWeight: '700',
                            color: '#c50000'
                          }}
                          value={this.props.params.size}
                          disabled
                        />
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <select
                          value={this.state.performanceselected}
                          onChange={this.filterHOUMANperformanceTire}
                          style={{
                            height: '40px',
                            width: '100%',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="">Seasonal Designation</option>
                          {newPerformance.map((k, index) => (
                            <option key={index} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <input
                            id="minpricefilter"
                            style={{ height: '40px', width: '48%' }}
                            type="number"
                            placeholder="Min. Price"
                            onChange={this.filterHOUMANpriceMinTires}
                          />
                          <input
                            id="maxpricefilter"
                            style={{ height: '40px', width: '48%' }}
                            type="number"
                            placeholder="Max. Price"
                            onChange={this.filterHOUMANpriceMaxTires}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <select
                          value={this.state.brandselected}
                          onChange={this.filterHOUMANbrandTire}
                          style={{
                            height: '40px',
                            width: '100%',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="">Tire Brand</option>
                          {newBrand
                            .sort((a, b) => b - a)
                            .map((k, index) => (
                              <option key={index} value={k}>
                                {k}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <select
                          value={this.state.rftselected}
                          onChange={this.filterHOUMANrft}
                          style={{
                            height: '40px',
                            width: '48%',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="">Runflat</option>
                          {Run_Flat.sort((a, b) => b - a).map((k, index) => (
                            <option key={index} value={k}>
                              {k === 'Run Flat tires' ? 'Yes' : 'No'}
                            </option>
                          ))}
                        </select>

                        <select
                          value={this.state.loadindexselected}
                          onChange={this.filterHOUMANloadindex}
                          style={{
                            height: '40px',
                            width: '48%',
                            marginLeft: '4%',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="">Load Index</option>
                          {loadIndex.sort((a, b) => b - a).map((k, index) => (
                            <option key={index} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                      <select
                          value={this.state.speedselected}
                          onChange={this.filterHOUMANspeed}
                          style={{
                            height: '40px',
                            width: '100%',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="">Speed Rating</option>
                          {speedRating.sort((a, b) => b - a).map((k, index) => (
                            <option key={index} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{display: 'flex'}}>
                        <input
                          value={this.state.Vancouverselected}
                          style={{ height: '20px', width: '20px' }}
                          type="checkbox"
                          onChange={this.filterHOUMANinventoryTires}
                        />
                        <label style={{ marginLeft: '8px' }}>Vancouver Stock Only</label>
                      </div>

                  </div>

                      <div style={{ display: 'flex'}}>
                        {/*  Apply & Close */}
                        <button
                          onClick={this.toggleFilterPanel}
                          style={{
                            alignSelf: 'center',
                            marginTop: '1px',
                            backgroundColor: '#960003',
                            color: 'white',
                            borderRadius: '0px 0px 5px 5px',
                            padding: '8px 20px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            border: '0px'
                          }}
                        >
                        {this.state.isFilterPanelVisible ? "Apply & Close" : "Filters"}
                          
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="white"
                            width="16px"
                            height="16px"
                            style={{ marginLeft: '8px', transition: 'transform 0.3s' }}>
                            <path
                              d={
                                this.state.isFilterPanelVisible
                                  ? "M12 8l-8 8h16z" // up
                                  : "M12 16l-8-8h16z" // Down
                              }
                            />
                          </svg>
                        </button>
                    </div>

                      </div>
                    </div>
                )}

{/* ///////////////////////////////////////////////// MOBILE /////////////////////////////////////////////////////// */}

                             { (this.props.params.search_by === 'Vehicle' || this.props.params.search_by === 'Size') && this.props.params.category === 'Wheels' &&
                                <div className={`houman_mobile_filter ${this.state.isFilterOpen ? 'Filter' : 'closed'}`} id="houman1" style={{
                                  width: '75%',
                                  position: 'fixed',
                                                  zIndex: '99',
                                  backgroundColor: 'rgb(0 0 0 / 85%)',
                                    transition: 'transform 0.5s ease',
                                   transform: this.state.isFilterOpen ? 'translateX(0)' : 'translateX(-98%)',
                                   }}>

                                    <div className="breadcrumbbar__filtersPanel__btnDdlContainer filter_select_dropdown houman_mobile_filter" id="houmanfilter" 
                                    style={{ width: '90%', margin: '1%', color: 'white', justifyContent: 'center', alignContent: 'normal', maxWidth: '1280px', boxSizing: 'border-box', marginLeft: 'auto', marginRight: 'auto' }}>
                                      <h5 className="filter_label">Filters:</h5>

                                      <button onClick={this.toggleFilter} className="filter-toggle-button" style={{left: '94%', backgroundColor: '#d60000', color: 'white'}}>
                                          {this.state.isFilterOpen ? 'Close' : 'Filter'}
                                      </button>

                                      { this.props.params.search_by !== 'Size' && <input style={{ height: '40px', marginTop: '8px', color: 'red', fontWeight: '700', width: '80%' }} value={this.props.size} disabled /> }
                                      <select value={this.state.brandselected} onChange={this.filterHOUMANbrand} style={{ height: '40px', marginTop: '8px', width: '80%', backgroundColor: 'white' }}>
                                        <option value="">All Brands</option>
                                        {newBrand.sort((a, b) => b - a).map((k, index) =>
                                            <option key={index} value={k}>{k}</option>
                                          )}
                                      </select>
                                      <input id='minpricefilter' style={{ height: '40px', marginTop: '8px', width: '80%' }} type='number' placeholder='Min Price' onChange={this.filterHOUMANpriceMin} />
                                      <input id='maxpricefilter' style={{ height: '40px', marginTop: '8px', width: '80%' }} type='number' placeholder='Max Price' onChange={this.filterHOUMANpriceMax} />
                                      <select value={this.state.widthselected} onChange={this.filterHOUMANwidth} style={{ height: '40px', marginTop: '8px', width: '80%', backgroundColor: 'white' }}>
                                        <option value="">All Width</option>
                                        {newWidth.map((k, index) =>
                                            <option key={index} value={k}>{k}</option>
                                        )}
                                      </select>

                                      <label style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                          value={this.state.Vancouverselected}
                                          style={{ height: '35px', width: 'auto' }}
                                          type="checkbox"
                                          onChange={this.filterHOUMANinventory}
                                        />
                                        <span style={{ marginLeft: '8px' }}>Vancouver Stock Only</span>
                                      </label>
                                    </div>
                                </div>
                             }

                                 { (this.props.params.search_by === 'Vehicle' || this.props.params.search_by === 'Size' ) && this.props.params.category === 'Tires' &&
                                  <div className={`houman_mobile_filter ${this.state.isFilterOpen ? 'Filter' : 'closed'}`} id="houman1" style={{
                                     width: '75%',
                                     position: 'fixed',
                                                     zIndex: '99',
                                     backgroundColor: 'rgb(0 0 0 / 85%)',
                                       transition: 'transform 0.5s ease',
                                      transform: this.state.isFilterOpen ? 'translateX(0)' : 'translateX(-98%)',
                                      }}>

                                    <div className="breadcrumbbar__filtersPanel__btnDdlContainer filter_select_dropdown houman_mobile_filter" id="houmanfilter" 
                                    style={{ width: '90%', margin: '1%', color: 'white', justifyContent: 'center', alignContent: 'normal', maxWidth: '1280px', boxSizing: 'border-box', marginLeft: 'auto', marginRight: 'auto' }}>
                                      <h5 className="filter_label">Filters:</h5>

                                      <button onClick={this.toggleFilter} className="filter-toggle-button" style={{left: '93%', backgroundColor: '#d60000', color: 'white'}}>
                                          {this.state.isFilterOpen ? 'Close' : 'Filter'}
                                      </button>

                                       <input style={{ height: '40px', marginTop: '8px', color: 'red', fontWeight: '700', width: '80%', textAlign: 'center' }} value={this.props.params.size} disabled/>
                                      <select value={this.state.performanceselected} onChange={this.filterHOUMANperformanceTire} style={{ height: '40px', marginTop: '8px', width: '80%', backgroundColor: 'white' }}>
                                        <option value="">ALL CATEGORIES</option>
                                        {newPerformance.map((k, index) =>
                                            <option key={index} value={k}>{k}</option>
                                        )}
                                      </select>
                                        <input id='minpricefilter' style={{ height: '40px', marginTop: '8px', width: '80%' }} type='number' placeholder='Min Price' onChange={this.filterHOUMANpriceMinTires} />
                                        <input id='maxpricefilter' style={{ height: '40px', marginTop: '5px', width: '80%' }} type='number' placeholder='Max Price' onChange={this.filterHOUMANpriceMaxTires} />
                                      <select value={this.state.brandselected} onChange={this.filterHOUMANbrandTire} style={{ height: '40px', marginTop: '8px', width: '80%', backgroundColor: 'white' }}>
                                        <option value="">ALL BRANDS</option>
                                        {newBrand.sort((a, b) => b - a).map((k, index) =>
                                            <option key={index} value={k}>{k}</option>
                                          )}
                                      </select>
                                     
                                      <select value={this.state.rftselected} onChange={this.filterHOUMANrft} style={{ height: '40px', marginTop: '8px', width: '80%', backgroundColor: 'white' }}>
                                        <option value="">RFT/Yes or No</option>
                                        {Run_Flat.sort((a, b) => b - a).map((k, index) =>
                                            <option key={index} value={k}>{k === "Run Flat tires" ? "Yes" : "No"}</option>
                                          )}
                                      </select>
                                     
                                      {/* <select value={this.state.speedselected} onChange={this.filterHOUMANspeed} style={{ height: '40px', marginTop: '8px', width: '80%', backgroundColor: 'white' }}>
                                        <option value="">SPEED RATING</option>
                                        {speedRating.sort((a, b) => b - a).map((k, index) =>
                                            <option key={index} value={k}>{k}</option>
                                          )}
                                      </select> */}

                                      <label style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                          value={this.state.Vancouverselected}
                                          style={{ height: '35px', width: 'auto' }}
                                          type="checkbox"
                                          onChange={this.filterHOUMANinventoryTires}
                                        />
                                        <span style={{ marginLeft: '8px' }}>Vancouver Stock Only</span>
                                      </label>
                                    </div>
                                </div>
                                }

                        <div className="top_gap" style={{ height: '50px' }} />

        { this.props.params.search_by === 'Vehicle' || this.props.params.search_by === 'Size' ?
           <div className='slider-container'>
           {sortSliders(sliders).map((slider, i) => {
             return (
               <div key={i}>
                 <h2 className="image-slider__title">{slider.group}

                  {/* {this.props.params.category === 'Tires' && slider.group === 'BFGoodrich' && <a onClick={(e) => this.showRebatesClicked('BFGoodrich')}>
                  <span className='rebates1' style={{ paddingLeft: '50%', color: '#00adff' }}><span className='rebates2' style={{ fontSize: '14px' }}>UP TO</span> <span className='rebates3' >$100</span>
                   <span className='rebates4' style={{ fontSize: '18px' }}>Rebates</span>
                  </span></a>} */}

                   {/* <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
                   <Dialog open={this.state.rebates === 'Yokohama'} onClose={(e) => this.handleCloseDialogRebates(e)}
                     maxWidth={'lg'}
                     aria-labelledby="form-dialog-title"
                     BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.5)', width: '100%', height: '100%', opacity: '0.09' } }}
                     PaperProps={{ style: { boxShadow: '0px 0px 0px #0f2050cf' } }}
                     >
                        <DialogTitle>
                          <img src='https://www.soratwheels.ca/media/brands/Yokohama.jpg' />
                        </DialogTitle>
                        <DialogContent>
                          <p>Sep 13 - Dec 20</p>
                          <br></br>  
                          <p className= 'rebate_dialog'><strong>$100:</strong> Geolandar X-AT G016</p>
                          <p className= 'rebate_dialog'><strong>$85:</strong> Geolandar CV 4S G061, Geolandar A/T G015, Geolandar A/T XD G017, Geolandar A/T4 G018</p>
                          <p className= 'rebate_dialog'><strong>$70:</strong> IceGuard IG53, G075, IG51, BlueEarth Winter V906, V905, Geolandar I/T G072, CV G058, X-CV G057, M/T G003, Avid Ascend GT, Avid Ascend LX</p>     
                          <br></br>
                          <a href='https://yokohama.ca/en/new-vehicle-purchase-winter-rebate-program' style={{color: 'red'}}><span>CLAIM ONLINE</span></a>
                        </DialogContent>
                        <DialogActions>
                          <Button className="vehicleSelection-contentTires__btnlist"
                            onClick={(e) => this.handleCloseDialogRebates(e)}>
                            Close
                            </Button>
                        </DialogActions>
                   </Dialog>
                 </div> */}

                </h2>
                 <div className="image-slider__item">
                   <div className="productList-resultSlider">
                     {slider.products}
                   </div>
                 </div>
               </div>
             );
           })}
         </div> :
          <div className='slider-container'>
             {sortSliders(sliders).map((slider, i) => {
               return (
               <div key={i}>
                 <h2 className="image-slider__title">{slider.group}</h2>
                 <div className="image-slider__item">
                   <div className="productList-resultSlider">
                     {slider.products}
                   </div>
                 </div>
               </div>
               );
             })}
         </div>
            }
        {this.state.showVehicleModal && this.renderVehicleModal()}
      </div>
    );
  }

  closePopup() {
    jQuery('#overlaydivProductSelection').hide();
  }
}

const mapStateToProps = state => ({
  cartProducts: state.cart.products,
  newProduct: state.cart.productToAdd,
  productToRemove: state.cart.productToRemove,
  productToChange: state.cart.productToChange,
  cartTotal: state.total.data
});

export default connect(mapStateToProps, { addProduct })(ImageSlider);

ImageSlider.propTypes = {
  groupAttr: React.PropTypes.string.isRequired,
  params: React.PropTypes.object.isRequired,
  productData: React.PropTypes.array.isRequired,
  searchBy: React.PropTypes.string.isRequired,
  size: React.PropTypes.string
};
