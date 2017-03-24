'use babel'
/*!
 * Atom Bugs
 * Copyright(c) 2017 Williams Medina <williams.medinaa@gmail.com>
 * MIT Licensed
 */

import {
  createGroupButtons,
  createButton,
  createIcon,
  createIconFromPath,
  createText,
  createElement,
  insertElement,
  attachEventFromObject
} from '../element/index'

import { EventEmitter }  from 'events'
import { parse } from 'path'

export interface ConsoleOptions {

}

export class ConsoleView {

  private element: HTMLElement
  private events: EventEmitter

  constructor (options?: ConsoleOptions) {

    this.events = new EventEmitter()
    this.element = createElement('atom-bugs-console')
  }

  clearConsole () {
    this.element.innerHTML = ''
  }

  createConsoleLine (entry: string, elements?) {
    let line = createElement('atom-bugs-console-line')
    if (entry && entry.length > 0) {
      line.innerHTML = entry
    }
    if (elements) {
      insertElement(line, elements)
    }
    setTimeout (() => {
      this.element.scrollTop = this.element.scrollHeight
    }, 250)
    return insertElement(this.element, line)
  }

  getElement () {
    return this.element
  }

  destroy () {
    this.element.remove()
  }
}
