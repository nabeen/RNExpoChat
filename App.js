/* eslint no-alert: 0, jsx-a11y/accessible-emoji: 0  */

import React, { Component } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { DATABASE_URL } from 'react-native-dotenv';
import firebase from 'firebase';
import Expo from 'expo';

import messagesData from './data';
import NavBar from './NavBar';
import CustomView from './CustomView';

const getItemNum = 10;
const userName = 'unknown';
const userAvatar = 'https://source.unsplash.com/sseiVD2XsOk/100x100';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      loadEarlier: true,
    };

    this.onSend = this.onSend.bind(this);

    firebase.initializeApp({
      databaseURL: DATABASE_URL,
    });
  }

  componentWillMount() {
    // init with only system messages
    this.setState({ messages: messagesData.filter((message) => message.system) });

    firebase.database().ref().child('messages').limitToLast(getItemNum)
    .on('child_added', (child) => {
      const postData = child.val();
      this.setState((previousState) => ({
        messages: GiftedChat.append(previousState.messages,
          {
            _id: postData._id,
            createdAt: postData.createdAt,
            text: postData.text,
            user: postData.user,
            sent: true
          }
        ),
      }));
    });
  }

  onSend(messages = []) {
    const data = messages[0];
    console.log(data);

    firebase.database().ref().child('messages').push({
      _id: data._id,
      createdAt: new Date().getTime(),
      text: data.text,
      user: data.user,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <NavBar />
        <GiftedChat
          messages={this.state.messages}
          onSend={this.onSend}
          loadEarlier={this.state.loadEarlier}
          renderCustomView={CustomView}
          user={{
            _id: Expo.Constants.deviceId,
            name: userName,
            avatar: userAvatar
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
