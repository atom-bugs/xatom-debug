'use babel';
/*!
 * XAtom Debug
 * Copyright(c) 2017 Williams Medina <williams.medinaa@gmail.com>
 * MIT Licensed
 */

const { CompositeDisposable, Emitter, Disposable } = require('atom');
import { View, ViewElement } from './View';
import ResizeObserver from 'resize-observer-polyfill';
import { spawn as spawnPty } from 'node-pty';
import Terminal from 'xterm';

const path = require('path');
Terminal.loadAddon('fit');

export const DEBUG_AREA_URI = 'xatom://debug-area';

@View({
  name: 'xatom-debug-area'
})
export class DebugAreaView {
  private resizeObserver: any;
  private resizeHandler: any;
  private terminal: any;
  private pty: any;
  public element: HTMLElement;
  public emitter = new Emitter();
  constructor(private viewElement: ViewElement) {
    this.element = this.getElement();
  }
  elementDidResize () {
    clearTimeout(this.resizeHandler);
    this.resizeHandler = setTimeout(() => {
      if (this.terminal) {
        this.terminal.fit();
        if(this.pty) this.pty.resize(this.terminal.cols, this.terminal.rows);
      };
    }, 250);
  }
  onDidExitProcess (cb) {
    return this.emitter.on('didExitProccess', cb);
  }
  showInitialMessage () {
    const date = new Date().toString();
    this.terminal.writeln(`\x1b[1m\x1b[90mXAtom: Debugger v1.6.11\x1b[0m\x1b[0m`);
    this.terminal.writeln(`\x1b[1m\x1b[90m${date}\x1b[0m\x1b[0m`);
  }
  startProcess (command: string, args?: string[], options?: any) {
    const projectPaths = atom.project.getPaths();
    const defaultOptions = {
      name: 'xterm-color',
      cwd: path.resolve(process.env.HOME),
      env: Object.assign({}, process.env, {
        TERM: 'xterm-256color',
        CLICOLOR: '1',
        LSCOLORS: 'ExFxCxDxBxegedabagacad'
      })
    };
    this.pty = spawnPty(command,
      args || [],
      Object.assign(defaultOptions, options));
    this.terminal = new Terminal();
    this.terminal.open(this.getElement(), true);
    this.terminal.on('data', (data) => {
      return this.pty.write(data);
    });
    this.showInitialMessage();

    this.element.addEventListener('focus', () => this.terminal.focus());
    this.resizeObserver = new ResizeObserver(this.elementDidResize.bind(this));
    this.resizeObserver.observe(this.element);

    this.pty.on('data', (data) => {
      return this.terminal.write(data);
    });
    this.pty.on('exit', () => {
      this.emitter.emit('didExitProccess')
      this.destroy();
    });
    return this.pty;
  }
  destroy () {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.pty) this.pty.kill();
    if (this.terminal) this.terminal.destroy();
    this.pty = null;
  }
  clear () {
    this.terminal.clear();
  }
  copySelection () {
    let selectedText = window.getSelection().toString();
    let preparedText = this.formatText(selectedText);
    atom.clipboard.write(preparedText);
  }
  pasteFromClipboard () {
    let text = atom.clipboard.read();
    this.pty.write(text);
  }
  formatText (text: string) {
    const space = String.fromCharCode(32);
    const nonBreakingSpace = String.fromCharCode(160);
    const allNonBreakingSpaces = new RegExp(nonBreakingSpace, 'g');
    return text.split('\n').map((line) => {
      return line.replace(/\s+$/g, '').replace(allNonBreakingSpaces, space);
    }).join('\n');
  }
  getDefaultLocation () {
    return 'bottom';
  }
  getAllowedLocations () {
    return ['bottom', 'top', 'center'];
  }
  getElement () {
    return this.viewElement.element;
  }
  getURI () {
    return DEBUG_AREA_URI;
  }
  getIconName () {
    return 'debug-area';
  }
  getTitle () {
    return 'Debug Area';
  }
}
