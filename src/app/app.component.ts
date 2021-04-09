import { Component } from '@angular/core';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

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
      takeWhile(() => this.sessionRunning),
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
      takeWhile(() => !this.timerPaused && this.timeLeft > 0),
      map((e) => {
        this.timeLeft -= 1;
        const origTime = this.breakLength * 60;
        this.fillHeight = (e / origTime) * 100;
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
        this.sessionRunning = true;
        const minutes: number = this.sessionLength;
        this.timeLeft = minutes * 60;
        this.currSession = new Session();
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

  private startObservableTimer(sub: Subscription) {
    this.sessionTimerSubscription = this.$sessionTimer.subscribe(
      (e) => null,
      (err) => console.error(err),
      () => {
        console.log(this.timeLeft);

        if (this.timeLeft <= 0 || !this.sessionRunning) {
          this.wrapUpSession();
        }
        console.log('Timer finished');
      }
    );
  }

  private clearObservableTimer(sub: Subscription) {
    // sub.unsubscribe();
  }

  public wrapUpSession() {
    if (this.timeLeft == this.sessionLength * 60) {
      return;
    }
    console.log('Wrapping up session');
    this.currSession = {
      taskName: this.currTaskName,
      sessionElapsedTime: this.sessionLength * 60 - this.timeLeft,
    };
    this.sessions.push(this.currSession);
    this.sessionRunning = false;

    // reset vars
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
