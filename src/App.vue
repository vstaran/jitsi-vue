<template>
  <div id="app">
    <fullscreen v-model="fullscreen">
      <button id="btn_fs" type="button" @click="toggle" v-if="!fullscreen">F</button>

      <!-- <button @click="connect">Connect</button> -->
      <video v-for="track in videoTracks.slice(0, 1)" :key="`track-${track.getId()}`" :ref="track.getId()" autoplay />
      <audio v-for="track in audioTracks" :key="`track-${track.getId()}`" :ref="track.getId()" autoplay />
    </fullscreen>
  </div>
</template>

<script>
import { connect, createAndJoinRoom, createTracksAndAddToRoom } from './utils/jitsiUtils'
import JitsiMeetJS from '@lyno/lib-jitsi-meet'
import VueFullscreen from 'vue-fullscreen'
import Vue from 'vue'
Vue.use(VueFullscreen)

import { config } from 'dotenv';
config();

export default {
  name: 'App',

  data() {
    return {
      fullscreen: false,
      videoTracks: [],
      audioTracks: [],
    }
  },

  methods: {
    addTrack(track) {
      if (track.getType() === 'video' && !!+process.env.VUE_APP__ROOM_VIDEO) {
        this.videoTracks.push(track);
      } else if (track.getType() === 'audio' && !!+process.env.VUE_APP__ROOM_AUDIO) {
        this.audioTracks.push(track);
      }
      this.$nextTick().then(() => {
        track.attach(this.$refs[track.getId()][0]);
      })
    },

    connect() {
      console.log('methods:connect')

      const roomName = process.env.VUE_APP__ROOM_NAME;
      connect(roomName).then(connection => {
        return createAndJoinRoom(connection, roomName);
      })
      .then(room => {
        room.on(JitsiMeetJS.events.conference.TRACK_ADDED, track => this.addTrack(track));
        createTracksAndAddToRoom(room);
      })
      .catch(error => console.error(error));
    },

    toggle () {
      this.fullscreen = !this.fullscreen
    }
  },

  beforeMount() {
    console.log(': ' + process.env.VUE_APP__DOMAIN);
    console.log(': ' + process.env.VUE_APP__ROOM_NAME);
    console.log(': ' + process.env.VUE_APP__USER_NAME);
    console.log(': ' + process.env.VUE_APP__USER_PASSWORD);
  },

  mounted() {
    this.connect()
  },
}

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

video {
  position: fixed; right: 0; bottom: 0;
  min-width: 100%; min-height: 100%;
  width: auto; height: auto; z-index: -100;
  background-size: cover;
}

#btn_fs {
  opacity: 0.4;
  background: transparent;
  border: 1px solid;
}
</style>



