import { Component } from '@angular/core';
import { interval, Subscription, timer } from 'rxjs';
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
  sessionLength = 25;
  sessionType = SessionType.SESSION;
  timeLeft =
    this.sessionType == SessionType.BREAK
      ? this.breakLength
      : this.sessionLength;
  // fillHeight = '0%';
  // fillColor = '#7de891';
  $timer: Subscription;
  timerPaused = false;

  constructor() {
    this.$timer = interval(1000)
      .pipe(
        takeWhile(() => !this.timerPaused),
        map((e) => console.log(e))
      )
      .subscribe();
  }

  breakIncrement(val: number) {
    this.breakLength += val;
  }

  sessionIncrement(val: number) {
    this.sessionLength += val;
  }

  timerStartPause() {
    this.timerPaused = !this.timerPaused;
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

  // get timeStarted() {
  //   // return this.$
  // }
}
function takeUntil(
  timerPaused: boolean
): import('rxjs').OperatorFunction<number, unknown> {
  throw new Error('Function not implemented.');
}
