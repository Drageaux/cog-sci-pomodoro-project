import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'CogSciTeam10';
  breakLength = 5;
  sessionLength = 25;

  breakIncrement(val: number) {
    this.breakLength += val;
  }

  sessionIncrement(val: number) {
    this.sessionLength += val;
  }

  timerStartPause() {}

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
}
