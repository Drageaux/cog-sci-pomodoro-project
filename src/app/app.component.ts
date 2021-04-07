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
  sessionLength = 1;
  sessionType = SessionType.SESSION;
  timeLeft;
  fillHeight = 0;
  fillColor = '#7de891';
  $timer;
  timerPaused = true;

  constructor() {}

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

      this.timeLeft = minutes * 60;
      this.startObservableTimer();
    } else {
      this.clearObservableTimer();
    }
    // this.timerPaused ? this.$timer.unsubscribe() : this.$timer.subscribe();
    // const remainingTime = this.timeLeft;
    // console.log(remainingTime);
  }

  private startObservableTimer() {
    this.$timer = interval(1000)
      .pipe(
        takeWhile(() => !this.timerPaused && this.timeLeft > 0),
        map((e) => {
          this.timeLeft -= 1;
          const origTime = SessionType.SESSION
            ? this.sessionLength * 60
            : this.breakLength * 60;
          this.fillHeight = (e / origTime) * 100;
        })
      )
      .subscribe();
  }

  private clearObservableTimer() {
    this.$timer.unsubscribe();
  }

  displayTimeRemaining(d: number) {
    const hours = Math.floor(d / 3600);
    const minutes = Math.floor((d % 3600) / 60);
    const seconds = Math.floor((d % 3600) % 60);
    return (
      (hours > 0 ? hours + ':' + (minutes < 10 ? '0' : '') : '') +
      minutes +
      ':' +
      (seconds < 10 ? '0' : '') +
      seconds
    );
  }

  // get timeStarted() {
  //   // return this.$
  // }
}
