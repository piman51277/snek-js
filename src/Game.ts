import { snekAI } from "./snekai";

export enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
}

export interface ISnek {
  x: number[];
  x_mask: boolean[];
  length: number;
  direction: Direction;
}

export class Game {
  snek: ISnek;
  food: number;
  game_over: boolean;
  score: number;

  constructor() {
    this.snek = {
      x: [40],
      x_mask: [],
      length: 1,
      direction: Direction.RIGHT,
    };

    //initialize the mask
    for (let i = 0; i < 64; i++) {
      this.snek.x_mask.push(false);
    }
    this.snek.x_mask[40] = true;

    this.spawnFood();
    this.game_over = false;
    this.score = 0;
  }

  private spawnFood(): void {
    //if the board is full, don't bother
    if (this.snek.length === 64) {
      return;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.food = Math.floor(Math.random() * 64);
      if (!this.snek.x_mask[this.food]) {
        break;
      }
    }
  }

  public growSnek(): void {
    this.snek.length++;
    this.snek.x.push(this.food);

    //regenerate the mask
    for (let i = 0; i < 64; i++) {
      this.snek.x_mask[i] = false;
    }

    for (let i = 0; i < this.snek.length; i++) {
      this.snek.x_mask[this.snek.x[i]] = true;
    }
  }

  public movePos(new_head: number): void {
    //dead?
    if (this.game_over) {
      return;
    }

    //self-collision
    const tail = this.snek.x[0]; //tail is exception

    if (this.snek.x_mask[new_head] && new_head !== tail) {
      this.game_over = true;
      return;
    }

    //check for food
    if (new_head === this.food) {
      this.growSnek();
      this.spawnFood();
    } else {
      //remove tail
      this.snek.x_mask[tail] = false;
      this.snek.x.shift();

      //add head
      this.snek.x.push(new_head);
      this.snek.x_mask[new_head] = true;
    }

    //if we hit 64, we win
    if (this.snek.length === 64) {
      this.game_over = true;
    }
  }

  public reset(): void {
    this.snek = {
      x: [40],
      x_mask: [],
      length: 1,
      direction: Direction.RIGHT,
    };

    //initialize the mask
    for (let i = 0; i < 64; i++) {
      this.snek.x_mask.push(false);
    }
    this.snek.x_mask[40] = true;

    this.spawnFood();
    this.game_over = false;
    this.score = 0;
  }

  public nextTick(): void {
    const next = snekAI(this.snek, this.food);

    this.movePos(next);
    this.score = this.snek.length;
  }
}
