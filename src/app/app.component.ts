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
  productivityLevel?: number = 3; // out of 5
  stressLevel?: number = 3; // out of 5
  focusLevel?: number = 3; // out of 5
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
  TimerType = TimerType;
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

  constructor() {
    this.poms = localStorage.getItem('poms')
      ? JSON.parse(localStorage.getItem('poms'))
      : [];
    try {
      this.poms.every((e) => e);
    } catch {
      console.warn('Could not parse saved Pomodoros in local storage.');
      this.clearStorage();
      this.poms = [];
    }

    this.$sessionTimer = interval(1000).pipe(
      takeWhile(
        () =>
          this.pomodoroRunning &&
          this.timerType === TimerType.SESSION &&
          this.timeLeft > 0
      ),
      map((e) => {
        if (!this.timerPaused) {
          const origTime = this.sessionLength * 60;
          this.fillHeight = (this.currPom.sessionElapsedTime / origTime) * 100;
          return 1;
        }
        return 0;
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
          const origTime = this.breakLength * 60;
          this.fillHeight = (this.currPom.breakElapsedTime / origTime) * 100;
          return 1;
        }
        return 0;
      })
    );
  }

  /*************************************************************************/
  /********************************* TIMER *********************************/
  /*************************************************************************/
  breakIncrement(val: number) {
    this.breakLength += val;
  }

  sessionIncrement(val: number) {
    this.sessionLength += val;
  }

  timerToggle() {
    // toggle paused/started
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
        this.startPomodoro();
      }
    } else {
      console.log(`Paused: time left = ${this.timeLeft}s`);
    }
  }

  private setupTimer() {
    this.timeLeft = 0;
    const minutes: number =
      this.timerType == TimerType.SESSION
        ? this.sessionLength
        : this.breakLength;
    this.timeLeft = minutes * 60;
  }

  private startPomodoro() {
    this.pomodoroSubscription = this.$sessionTimer.subscribe({
      next: (e) => {
        this.currPom.sessionElapsedTime += e;
        this.timeLeft -= e;
      },
      error: console.error,
      complete: () => {
        this.wrapUpSession();
        console.log('Session finished. Begin break.');
        // begin break
        this.timerType = TimerType.BREAK;
        this.setupTimer(); // should call to restart timer
        this.$breakTimer.subscribe({
          next: (e) => {
            this.currPom.breakElapsedTime += e;
            this.timeLeft -= e;
          },
          error: console.error,
          complete: () => {
            this.wrapUpBreak();
            this.wrapUpPom();
            console.log('Pomodoro done!');
          },
        });
      },
    });
  }

  /*************************************************************************/
  /******************************** HELPERS ********************************/
  /*************************************************************************/
  public wrapUpSession() {
    if (this.timerType === TimerType.SESSION) {
      this.timeLeft = 0;
      this.timerPaused = false;
    }
  }

  public wrapUpBreak() {
    if (this.timerType === TimerType.BREAK) {
      this.timeLeft = 0;
    }
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
    localStorage.setItem('poms', JSON.stringify(this.poms));

    // reset vars
    this.timerPaused = true;
    this.currPom = null;
    this.timeLeft = null;
    this.fillHeight = 0;
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

  /*************************************************************************/
  /****************************** FIELD INPUTS *****************************/
  /*************************************************************************/
  private clearStorage() {
    localStorage.removeItem('poms');
  }

  clearStorageBtn() {
    if (confirm('Are you sure to delete all Pomodoro entries?')) {
      this.poms = [];
      this.clearStorage();
    }
  }
}
