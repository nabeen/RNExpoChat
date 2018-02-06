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

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      loadEarlier: true
    };

    this.onSend = this.onSend.bind(this);

    firebase.initializeApp({
      databaseURL: DATABASE_URL,
    });
  }

  componentWillMount() {
    // init with only system messages
    this.setState({ messages: messagesData.filter((message) => message.system) });

    firebase.database().ref().child('messages').limitToLast(3)
    .on('child_added', (child) => {
      const postData = child.val();
      this.setState((previousState) => ({
        messages: GiftedChat.append(previousState.messages,
          {
            _id: postData._id,
            createdAt: postData.createdAt,
            text: postData.text,
            user: {
              _id: postData.user._id === Expo.Constants.deviceId ? 1 : 2,
              name: 'UnknownUser',
            },
            sent: true
          }
        ),
      }));
    });
  }

  onSend(messages = []) {
    console.log(messages[0]);
    firebase.database().ref().child('messages').push({
      _id: messages[0]._id,
      createdAt: new Date().getTime(),
      text: messages[0].text,
      user: {
        _id: Expo.Constants.deviceId,
        name: 'UnknownUser'
      }
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
            _id: 1,
          }}
        />
      </View>
    );
  }
}
