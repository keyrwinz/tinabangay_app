import React, { Component } from 'react';
import Style from './Style.js';
import { View, Image, TouchableHighlight, Text, ScrollView, FlatList, TextInput, Picker, Platform} from 'react-native';
import { Routes, Color, Helper, BasicStyles } from 'common';
import { Spinner, Empty, ImageUpload, GooglePlacesAutoComplete, DateTime } from 'components';
import Api from 'services/api/index.js';
import Currency from 'services/Currency.js';
import { connect } from 'react-redux';
import Config from 'src/config.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserCircle, faMapMarker } from '@fortawesome/free-solid-svg-icons';
import { Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
const height = Math.round(Dimensions.get('window').height);
class Rides extends Component{
  constructor(props){
    super(props);
    this.state = {
      isLoading: false,
      data: null
    }
  }

  componentDidMount(){
    this.retrieve()
  }

  retrieve = () => {
    const { scannedUser } = this.props.state;
    if(scannedUser === null){
      return
    }
    let parameter = {
      condition: [{
        value: scannedUser.id,
        clause: '=',
        column: 'account_id'
      }]
    }
    this.setState({
      isLoading: true
    })
    Api.request(Routes.ridesRetrieve, parameter, response => {
      this.setState({isLoading: false})
      if(response.data.length > 0){
        this.setState({data: response.data})
      }else{
        this.setState({data: null})
      }
    }, error => {
      this.setState({isLoading: false})
    });
  }

  _data = () => {
    const { data, selected } = this.state;
    return (
      <View style={{
        backgroundColor: Color.white,
        position: 'relative',
        zIndex: -1
      }}>
        <FlatList
          data={data}
          extraData={selected}
          ItemSeparatorComponent={this.FlatListItemSeparator}
          renderItem={({ item, index }) => (
            <View style={{
              borderRadius: 5,
              marginBottom: 10,
              borderColor: Color.gray,
              borderWidth: 1,
              position: 'relative',
              zIndex: -1
            }}>
              <TouchableHighlight
                onPress={() => {console.log('hello list')}}
                underlayColor={Color.gray}
                >
                <View style={Style.TextContainer}>
                  <View style={{
                    flexDirection: 'row'
                  }}>
                    <Text
                      style={[BasicStyles.titleText, {
                        paddingTop: 10,
                        fontWeight: 'bold',
                        color: Color.primary
                      }]}>
                      {item.code ? item.code: ''} {item.type}
                    </Text>
                  </View>
                  <Text
                    style={[BasicStyles.normalText, {
                      paddingTop: 10,
                      color: Color.darkGray
                    }]}>
                    {item.from} - {item.to}
                  </Text>
                  <Text
                    style={[BasicStyles.normalText, {
                      color: Color.darkGray
                    }]}>
                    {item.from_date_human} - {item.to_date_human}
                  </Text>
                  {
                    (item.from_status == 'death' || item.to_status == 'death') && (
                      <View style={{
                        backgroundColor: 'black',
                        borderRadius: 2,
                        marginRight: 20,
                        marginLeft: 20,
                        marginBottom: 10,
                        marginTop: 10
                      }}>
                        <Text style={{
                          color: Color.white,
                          paddingTop: 2,
                          paddingBottom: 2,
                          paddingLeft: 10,
                          paddingRight: 10
                        }}>
                          There was a death in this route.
                        </Text>
                      </View>
                    )
                  }

                  {
                    (item.from_status == 'positive' || item.to_status == 'positive') && (
                      <View style={{
                        backgroundColor: Color.danger,
                        borderRadius: 2,
                        marginRight: 20,
                        marginLeft: 20,
                        marginBottom: 10,
                        marginTop: 10
                      }}>
                        <Text style={{
                          color: Color.white,
                          paddingTop: 2,
                          paddingBottom: 2,
                          paddingLeft: 10,
                          paddingRight: 10
                        }}>
                          There was a COVID Positive in this route.
                        </Text>
                      </View>
                    )
                  }
                  {
                    (item.from_status == 'pum' || item.to_status == 'pum') && (
                      <View style={{
                        backgroundColor: Color.warning,
                        borderRadius: 2,
                        marginRight: 20,
                        marginLeft: 20,
                        marginBottom: 10,
                        marginTop: 10
                      }}>
                        <Text style={{
                          color: Color.white,
                          paddingTop: 2,
                          paddingBottom: 2,
                          paddingLeft: 10,
                          paddingRight: 10
                        }}>
                          There was a PUM in this route.
                        </Text>
                      </View>
                    )
                  }

                  {
                    (item.from_status == 'pui' || item.to_status == 'pui') && (
                      <View style={{
                        backgroundColor: Color.primary,
                        borderRadius: 2,
                        marginRight: 20,
                        marginLeft: 20,
                        marginBottom: 10,
                        marginTop: 10
                      }}>
                        <Text style={{
                          color: Color.white,
                          paddingTop: 2,
                          paddingBottom: 2,
                          paddingLeft: 10,
                          paddingRight: 10
                        }}>
                          There was a PUI in this route.
                        </Text>
                      </View>
                    )
                  }
                  {
                    (item.from_status == 'negative' || item.to_status == 'negative') && (
                      <View style={{
                        backgroundColor: 'green',
                        borderRadius: 2,
                        marginRight: 20,
                        marginLeft: 20,
                        marginBottom: 10,
                        marginTop: 10
                      }}>
                        <Text style={{
                          color: Color.white,
                          paddingTop: 2,
                          paddingBottom: 2,
                          paddingLeft: 10,
                          paddingRight: 10
                        }}>
                          This route is clear.
                        </Text>
                      </View>
                    )
                  }

                  
                </View>
              </TouchableHighlight>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  }

  render() {
    const { user } = this.props.state;
    const { isLoading, newDataFlag, data } = this.state;
    return (
      <ScrollView
        style={Style.ScrollView}
        onScroll={(event) => {
          if(event.nativeEvent.contentOffset.y <= 0) {
            if(this.state.isLoading == false){
              this.retrieve()
            }
          }
        }}
        >
        {
          data == null && (
            <Empty /> 
          )
        }
        {
          data !== null && (this._data())
        }
      </ScrollView>
    );
  }
}
const mapStateToProps = state => ({ state: state });

const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux');
  return {
    setPreviousRoute: (previousRoute) => dispatch(actions.setPreviousRoute(previousRoute))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Rides);
