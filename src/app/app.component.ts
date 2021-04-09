import { Component } from '@angular/core';
import { iif, interval, Observable, Subscription, timer } from 'rxjs';
import {
  map,
  skipWhile,
  switchMap,
  takeUntil,
  takeWhile,
} from 'rxjs/operators';

enum TimerType {
  SESSION = 'Session',
  BREAK = 'Break',
}

class Pomodoro {
  taskName: string = '';
  sessionElapsedTime: number = 0; // in seconds
  breakElapsedTime: number = 0; // in seconds
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

  // POMODORO
  private timeLeft = null;
  timerType = TimerType.SESSION;
  pomodoroSubscription: Subscription;
  pomodoroRunning = false;
  timerPaused = true;
  poms: Pomodoro[] = [];
  currPom: Pomodoro = null;
  currTaskName: string = '';
  // break
  breakLength = 5;
  $breakTimer;
  // work session
  sessionLength = 25;
  $sessionTimer;

  // styling
  fillHeight = 0;
  fillColor = '#7de891';

  constructor() {
    this.$sessionTimer = interval(1000).pipe(
      takeWhile(
        () =>
          this.pomodoroRunning &&
          this.timerType === TimerType.SESSION &&
          this.timeLeft > 0
      ),
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
      takeWhile(
        () =>
          this.pomodoroRunning &&
          this.timerType === TimerType.BREAK &&
          this.timeLeft > 0
      ),
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
    // toggle paused/start
    this.timerPaused = !this.timerPaused;

    // if just started
    if (!this.timerPaused) {
      // still time left
      if (this.timeLeft > 0) {
        console.log(`Resumed: time left = ${this.timeLeft}s`);
      }
      // timer not started yet
      else if (this.timeLeft == null) {
        // start new Pomodoro
        this.currPom = new Pomodoro();
        // TODO: probably could check if running by checking if currPom is not null
        this.pomodoroRunning = true;
        // making sure starting Pom with a work session
        this.timerType = TimerType.SESSION;
        this.setupTimer(); // should call to restart timer
        this.startPomodoro(this.pomodoroSubscription);
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

  private setupTimer() {
    this.timeLeft = 0;
    const minutes: number =
      this.timerType == TimerType.SESSION
        ? this.sessionLength
        : this.breakLength;
    // since it takes 1s for interval() to update, just go ahead and decrement by 1
    // because when it's 0, it needs to perform a final check at 0 second anyways
    this.timeLeft = minutes - 1;
  }

  private startPomodoro(sub: Subscription) {
    this.pomodoroSubscription = this.$sessionTimer.pipe().subscribe(
      (e) => this.currPom.sessionElapsedTime++,
      (err) => console.error(err),
      () => {
        console.log('Session finished. Begin break.');
        this.timerType = TimerType.BREAK;
        this.setupTimer();
        this.$breakTimer.subscribe(
          () => this.currPom.breakElapsedTime++,
          console.error,
          () => {
            this.wrapUpPom();
            console.log('Pomodoro done!');
          }
        );
      }
    );
  }

  public wrapUpPom() {
    if (this.timeLeft == this.sessionLength * 60) {
      // time hasn't even elapsed
      return;
    }
    console.log('Wrapping up pom');
    this.pomodoroSubscription.unsubscribe();
    this.currPom.taskName = this.currTaskName;
    this.poms.push(this.currPom);
    this.pomodoroRunning = false;

    // reset vars
    this.timerPaused = true;
    this.currPom = null;
    this.timeLeft = null;
    this.currTaskName = '';
  }

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
