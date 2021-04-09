import { Component } from '@angular/core';
import { interval, Observable, Subscription, timer } from 'rxjs';
import {
  map,
  skipWhile,
  switchMap,
  takeUntil,
  takeWhile,
} from 'rxjs/operators';

enum SessionType {
  SESSION = 'Session',
  BREAK = 'Break',
}

class Session {
  taskName: string = '';
  sessionElapsedTime: number; // in seconds
  breakElapsedTime?: number; // in seconds
  productivityLevel?: number; // out of 5
  stressLevel?: number; // out of 5
  focusLevel?: number; // out of 5
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Pomodoro Evaluator';
  sessionType = SessionType.SESSION;

  breakRunning = false;
  breakLength = 5;
  $breakTimer;

  sessionRunning = false;
  sessionLength = 25;
  $sessionTimer;
  sessionTimerSubscription: Subscription;
  sessions: Session[] = [];
  currSession: Session = null;
  currTaskName: string = '';

  private timeLeft = null;
  fillHeight = 0;
  fillColor = '#7de891';
  timerPaused = true;

  constructor() {
    this.$sessionTimer = interval(1000).pipe(
      takeWhile(() => {
        if (this.sessionRunning && this.timeLeft > 0) {
          return true;
        }
        this.sessionType = SessionType.BREAK;
        return false;
      }),
      map((e) => {
        if (!this.timerPaused) {
          this.timeLeft -= 1;
          const origTime = this.sessionLength * 60;
          this.fillHeight = (e / origTime) * 100;
        }
        return e;
      })
    );

    this.$breakTimer = interval(1000).pipe(
      takeWhile(() => this.breakRunning && this.timeLeft > 0),
      map((e) => {
        if (!this.timerPaused) {
          this.timeLeft -= 1;
          const origTime = this.breakLength * 60;
          this.fillHeight = (e / origTime) * 100;
        }
        return e;
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
      if (this.timeLeft > 0) {
        console.log(`Resumed: time left = ${this.timeLeft}s`);
      } else if (this.timeLeft == null) {
        // start new timer
        this.currSession = new Session();
        this.startNewTimer(SessionType.SESSION);
        this.startObservableTimer(this.sessionTimerSubscription);
      }
    } else {
      console.log(`Paused: time left = ${this.timeLeft}s`);
      // console.log(this.sessionTimerSubscription.);
      // this.clearObservableTimer(this.sessionTimerSubscription);
    }
    // this.timerPaused ? this.$timer.unsubscribe() : this.$timer.subscribe();
    // const remainingTime = this.timeLeft;
    // console.log(remainingTime);
  }

  private startNewTimer(type: SessionType) {
    this.timeLeft = 0;
    this.sessionRunning = true;
    const minutes: number =
      type == SessionType.SESSION ? this.sessionLength : this.breakLength;
    this.timeLeft = minutes;
  }

  private startObservableTimer(sub: Subscription) {
    this.sessionTimerSubscription = this.$sessionTimer
      .pipe(
        skipWhile(() => this.sessionType == SessionType.SESSION),
        switchMap((e) => {
          console.log('Session finished. Begin break.', e);
          this.breakRunning;
          this.startNewTimer(SessionType.BREAK);
          return this.$breakTimer;
        })
      )
      .subscribe(
        (e) => console.log(e),
        (err) => console.error(err),
        () => {
          console.log('Pomodoro done');
          this.wrapUpSession();
        }
      );
  }

  private clearObservableTimer(sub: Subscription) {
    sub.unsubscribe();
  }

  public wrapUpSession() {
    if (this.timeLeft == this.sessionLength * 60) {
      return;
    }
    console.log('Wrapping up session');
    this.sessionTimerSubscription.unsubscribe();
    this.currSession = {
      taskName: this.currTaskName,
      sessionElapsedTime: this.sessionLength * 60 - this.timeLeft,
    };
    this.sessions.push(this.currSession);
    this.sessionRunning = false;
    this.breakRunning = false;

    // reset vars
    this.timerPaused = true;
    this.currSession = null;
    this.timeLeft = null;
    this.currTaskName = '';
  }

  private startBreakTimer() {}

  renderTimeHmmss(d: number) {
    if (d > 0) {
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
    } else {
      return '0:00';
    }
  }

  get timeRemainingRendered() {
    return this.renderTimeHmmss(this.timeLeft);
  }
}
