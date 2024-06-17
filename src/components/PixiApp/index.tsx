import { useApp } from "@pixi/react";
import { Application, Container, Sprite, Texture, ICanvas } from "pixi.js";
import { useEffect } from "react";
import CloudImg from "../../assets/cloud.png";
import ninja from "../ninja";

export const PixiApp = () => {
  const app: Application<ICanvas> = useApp();

  useEffect(() => {
    app.stage.removeChildren();

    const container = new Container();
    app.stage.addChild(container);

    const texture = Texture.from(CloudImg);

    for (let i = 0; i < 8; i++) {
      const cloud = new Sprite(texture);
      cloud.scale.set(0.25 + Math.random() * 0.25);
      cloud.x = Math.random() * app.screen.width;
      cloud.y = Math.random() * (app.screen.height - cloud.height);
      container.addChild(cloud);
    }

    const { update, move } = ninja(app);

    app.ticker.add((delta) => {
      container.children.forEach((cloud) => {
        cloud.x += cloud.scale.x * delta * 5;
        if(cloud.x > app.screen.width){
          cloud.x = -(cloud as Sprite).width;
          cloud.y = Math.random() * (app.screen.height - (cloud as Sprite).height);
        }
      });
      update();
    });

    window.addEventListener("mousedown", (e) => {
      move(e.clientX, e.clientY);
    });

    window.addEventListener("touchstart", (e) => {
      move(e.touches[0].clientX, e.touches[0].clientY);
    });
  }, [app]);

  return <></>;
};
