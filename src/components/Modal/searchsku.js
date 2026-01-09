import React from 'react';
import Paper from 'material-ui/Paper';
import Input from 'material-ui/Input';
import IconButton from 'material-ui/IconButton';
import SearchIcon from 'material-ui-icons/Search';
import Button from 'material-ui/Button';
import { connect } from 'react-redux';
import { addProduct } from '../Cart/Actions/CartActions';

class Search extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      sku: 'NO DATA', 
      children: [], 
      data: [], 
      searchTerm: '', 
      loading: false, 
      hooo: false, 
      invenhoo: [], 
      currentProductToAdd: '',
      showError: false
    };

    this.Styles = {
      root: {
        padding: '7px 20px',
        display: this.state.hooo ? 'none' : 'flex',
        alignItems: 'center',
        width: '400px'
      },
      root2: {
        padding: '2px 4px',
        display: this.state.hooo ? 'none' : 'flex',
        alignItems: 'center'
      },
      input: {
        flex: 1
      },
      iconButton: {
        padding: 10,
        color: 'rgb(135 8 8)',
        marginLeft: '15px'
      },
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
      SearchResultContainer: {
        display: 'flex',
        flexBasis: '33%',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        flexWrap: 'wrap'
      },
      resultItem: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: '0 0 33%'
      },
      divider: {
        height: 28,
        margin: 4
      }

    };
  }

  myChangeHandler = (event) => {
    this.setState({ searchTerm: event.target.value });
  }

  search = (event) => {
    event.preventDefault();
    
    if (!this.state.searchTerm || this.state.searchTerm.trim() === '') {
      this.setState({ showError: true });
      setTimeout(() => this.setState({ showError: false }), 3000);
      return;
    }
    
    this.setState({ showError: false });
    const url = 'https://www.soratwheels.ca/apii/wheels.php/search/wheels/sku/' + this.state.searchTerm.trim();

    this.setState({ loading: true });
    fetch(url)
          .then((response) => {
            return response.json();
          })
          .then((json) => {
            this.setState({ hooo: true, loading: false, data: [...json] });
          });
  }

  showInventory(child_id) {

           const url = 'https://panel.sorat.ca/apii/inventory.php?sku=' + child_id;
           fetch(url)
             .then(response => {
               return response.json();
             }).then(json => {
               if (!json || json.length === 0) {
                 json = [{ title: 'Inventories', available_qty: 0 }];
               }
               this.setState({ loading: false, invenhoo: json });
             });
  }

  handleCloseDialogInventories(e) {
    this.setState({ invenhoo: [] });
  }

    addToCartClickedWheels(product) {
  
      if (product.attribute_set_id === '13') {
        product.type = 'Tires';
        product.promo = ['0'];
        product.price = [product.price];
      } else if (product.attribute_set_id === '14') {
        product.type = 'Wheels';
        product.promo = [product.promo];
        product.price = [product.price];
      }
      product.quantity = 4;
      this.props.addProduct(product);
    }

  render() {

    if (this.state.loading) {
      return (
                    <div id="productList_loading" className="content-divLength">
                        {navigator.userAgent.toLowerCase().indexOf('chrome') > -1 || navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ?
                            <img src={'https://www.soratwheels.ca/pub/static/frontend/Soratwheels/ReactJS/statics/img/loading.svg'}/> :
                            <img src={'https://www.soratwheels.ca/pub/static/frontend/Soratwheels/ReactJS/statics/img/loading.gif'}/>}
                    </div>
      );
    } else if (this.state.hooo) {
      return (
                <div style={{ 
                  background: 'white', 
                  padding: '20px',
                  borderRadius: '12px'
                }}>
                  {/* Header */}
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '15px',
                    borderBottom: '2px solid #f0f0f0'
                  }}>
                    <div>
                      <h3 style={{ margin: '0', fontSize: '18px', color: '#2c3e50', fontWeight: '600' }}>
                        Search Results
                      </h3>
                      <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6c757d' }}>
                        SKU: {this.state.searchTerm} • {this.state.data.length} found
                      </p>
                    </div>
                    <button 
                      style={{
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#495057',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = '#e9ecef';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = '#f8f9fa';
                      }}
                      onClick={() => this.setState({ hooo: false })}
                    >
                      Search Again
                    </button>
                  </div>

                  {/* Results */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {this.state.data.slice(this.state.a, this.state.b).map((item) =>
                      <div key={item.child_id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'white',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '16px',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#C50000';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(197, 0, 0, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#e9ecef';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      >
                        {/* Image */}
                        <div style={{ marginRight: '16px', flexShrink: 0 }}>
                          { item.image === 'no_selection' || item.image === '' ?
                            <img src={window.baseUrl + '/pub/media/catalog/product/placeholder/default/soratimg.jpg'}
                              style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '4px' }} /> :
                            item.image.includes('https://panel.sorat.ca') || item.image.includes('directautoimport') ?
                                <img src={item.image} style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '4px' }} /> :
                                item.image.includes('wheelpros') || item.image.includes('https://wheel') ?
                                <img src={item.image} style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '4px' }} /> :
                          <img src={'https://www.soratwheels.ca/pub/media/catalog/product' + item.image}
                               style={{ width: '70px', height: '70px', objectFit: 'contain', borderRadius: '4px' }} />
                          }
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ 
                              margin: '0 0 4px 0', 
                              fontSize: '16px', 
                              color: '#2c3e50',
                              fontWeight: '600'
                            }}>
                              {item.tire_manufacturer} {item.name}
                            </h4>
                            <div style={{ 
                              display: 'flex', 
                              gap: '16px', 
                              fontSize: '13px', 
                              color: '#6c757d',
                              marginBottom: '4px'
                            }}>
                              <span> Wheel Size: {item.children[0].wheel_size}"</span>
                              <span></span>
                              <span>Bolt Pattern: {item.children[0].bolt_pattern_1}</span>
                              {item.children[0].center_bore && (
                                <div style={{ display: 'flex', gap: '16px' }}>
                                  <br/>
                                  <span>Center Bore: {item.children[0].center_bore}</span>
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: '12px', color: '#868e96' }}>
                              SKU: {item.sku}
                                          
                              {item.children[0].Shipping === 'Not Stock Call for ETA' ? 
                                <span style={{ color: '#dc3545', marginLeft: '15px' }}>Out of Stock</span> :
                                <span style={{ color: '#28a745', marginLeft: '15px' }}>{item.children[0].Shipping}</span>
                              }
                           
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ 
                              fontSize: '18px', 
                              fontWeight: '700', 
                              color: '#C50000'
                            }}>
                              ${(item.price * 100 / 100).toFixed(2)}
                            </div>
                            <button 
                              onClick={(e) => this.addToCartClickedWheels(item)}
                              style={{
                                background: 'linear-gradient(135deg, #C50000 0%, #a00000 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 8px rgba(197, 0, 0, 0.2)'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.boxShadow = '0 4px 12px rgba(197, 0, 0, 0.3)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = '0 2px 8px rgba(197, 0, 0, 0.2)';
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
              </div>
      );
    }

    return (
                <div style={{ 
                  background: 'transparent', 
                  height: 'auto', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  padding: '20px 0'
                }}>
                  <Paper 
                    component="form" 
                    onSubmit={this.search} 
                    style={{
                      padding: '12px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      maxWidth: '500px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      border: '2px solid #f0f0f0',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.border = '2px solid #C50000';
                      e.currentTarget.style.boxShadow = '0 6px 25px rgba(197, 0, 0, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.border = '2px solid #f0f0f0';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                     <Input
                         style={{ 
                           flex: 1,
                           fontSize: '16px',
                           color: '#2c3e50',
                           outline: 'none'
                         }}
                         value={this.state.SearchTerm}
                         placeholder="Enter Wheel SKU (e.g. WHL123456)"
                         onChange={this.myChangeHandler}
                         inputProps={{ 
                           'aria-label': 'search wheel sku',
                           style: { outline: 'none', boxShadow: 'none' }
                         }}
                         disableUnderline={true}
                       />
                           <IconButton 
                             type="submit" 
                             style={{
                               padding: '12px',
                               color: 'white',
                               background: 'linear-gradient(135deg, #C50000 0%, #a00000 100%)',
                               borderRadius: '8px',
                               marginLeft: '10px',
                               transition: 'all 0.3s ease'
                             }}
                             onMouseOver={(e) => {
                               e.currentTarget.style.transform = 'scale(1.05)';
                               e.currentTarget.style.boxShadow = '0 4px 15px rgba(197, 0, 0, 0.3)';
                             }}
                             onMouseOut={(e) => {
                               e.currentTarget.style.transform = 'scale(1)';
                               e.currentTarget.style.boxShadow = 'none';
                             }}
                             aria-label="search"
                           >
                             <SearchIcon />
                           </IconButton>
                  </Paper>
                  
                  {this.state.showError && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 16px',
                      background: '#fff5f5',
                      border: '1px solid #fed7d7',
                      borderRadius: '8px',
                      color: '#c53030',
                      fontSize: '14px',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      Please enter a SKU to search
                    </div>
                  )}
                </div>
    );
  }
}

const mapStateToProps = state => ({
  cartProducts: state.cart.products,
  newProduct: state.cart.productToAdd,
  productToRemove: state.cart.productToRemove,
  productToChange: state.cart.productToChange,
  cartTotal: state.total.data
});

export default connect(mapStateToProps, { addProduct })(Search);
