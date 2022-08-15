import JitsiMeetJS from '@lyno/lib-jitsi-meet';
import $ from 'jquery';
import options from '../options/config';
import { config } from 'dotenv';
config();

window.$ = $;

JitsiMeetJS.init();
JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.INFO);

export function createTracksAndAddToRoom(room) {
  JitsiMeetJS.createLocalTracks({
    devices: ['video', 'audio']
  }).then((tracks) => {
    tracks.forEach(track => {
      room.addTrack(track);
    });
  }).catch(error => {
      console.error('There was an error creating the local tracks:', error);
    }
  );
}

export function createAndJoinRoom(connection, roomName) {
  return new Promise((resolve) => {
    const room = connection.initJitsiConference(roomName, {});
    room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED, () => {
      resolve(room);
    });

    if(process.env.VUE_APP__USER_NAME) {
      room.setDisplayName(process.env.VUE_APP__USER_NAME);
    }

    room.setSenderVideoConstraint(process.env.VUE_APP__USER_VIDEO_CONSTRAINT)

    if(process.env.VUE_APP__USER_PASSWORD) {
      room.join(process.env.VUE_APP__USER_PASSWORD);
    } else {
      room.join();
    }
  });
}

export function connect(roomName) {
  return new Promise(((resolve, reject) => {
    let optionsWithRoom = { ...options };
    optionsWithRoom.serviceUrl = options.serviceUrl + `?room=${roomName}`;

    const token = (process.env.VUE_APP__TOKEN?.length)? process.env.VUE_APP__TOKEN:null
    const connection = new JitsiMeetJS.JitsiConnection(null, token, optionsWithRoom);

    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED, () => {
      resolve(connection);
    });
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_FAILED, (e) => {
      reject("The connection failed. - " + e);
    });
    connection.addEventListener(JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED, (e) => {
      console.log("Connection disconnected - " + e);
    });

    connection.connect();
  }))
}
