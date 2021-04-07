import { Component } from '@angular/core';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

enum SessionType {
  SESSION = 'Session',
  BREAK = 'Break',
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'CogSciTeam10';
  breakLength = 5;
  sessionLength = 90;
  sessionType = SessionType.SESSION;
  timeLeft;
  // fillHeight = '0%';
  // fillColor = '#7de891';
  $timer;
  timerPaused = true;

  constructor() {
    this.$timer = interval(1000).pipe(
      takeWhile(() => !this.timerPaused && this.timeLeft > 0),
      map(() => {
        this.timeLeft -= 1;
        // console.log()
      })
    );
  }

  breakIncrement(val: number) {
    this.breakLength += val;
  }

  sessionIncrement(val: number) {
    this.sessionLength += val;
  }

  timerStartPause() {
    this.timerPaused = !this.timerPaused;

    // start timer
    if (!this.timerPaused) {
      const minutes: number =
        this.sessionType == SessionType.SESSION
          ? this.sessionLength
          : this.breakLength;

      this.$timer.subscribe();
      this.timeLeft = minutes * 60;
    }
    // this.timerPaused ? this.$timer.unsubscribe() : this.$timer.subscribe();
    // const remainingTime = this.timeLeft;
    // console.log(remainingTime);
  }

  displayTimeRemaining(d) {
    d = Number(d);
    var hours = Math.floor(d / 3600);
    var minutes = Math.floor((d % 3600) / 60);
    var seconds = Math.floor((d % 3600) % 60);
    return (
      (hours > 0 ? hours + ':' + (minutes < 10 ? '0' : '') : '') +
      minutes +
      ':' +
      (seconds < 10 ? '0' : '') +
      seconds
    );
  }

  calculateTimeLeft(minute: number) {
    return new Date().setMinutes(minute);
  }

  // get timeStarted() {
  //   // return this.$
  // }
}
