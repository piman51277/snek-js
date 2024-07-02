import { Game } from "./Game";
import { Renderer } from "./Renderer";

/**
 * Calls callback when document is ready
 * @param {() => void} fn callback
 */
function ready(fn: () => void): void {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

ready(() => {
  const screen = new Renderer(
    document.getElementById("snek") as HTMLCanvasElement
  );

  const game = new Game();

  /**
   *
   */
  function tick(): void {
    game.nextTick();
    if (game.game_over) {
      game.reset();
    }

    screen.drawSnek(game.snek.x);
    screen.drawFood(game.food);

    requestAnimationFrame(tick);
  }

  tick();
});
