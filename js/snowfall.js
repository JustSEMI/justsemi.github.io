const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');

  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  const snowflakes = [];

  function createSnowflake() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 1,
      speedY: Math.random() * 1 + 0.5,
      speedX: Math.random() * 1 - 0.5,
    };
  }

  function drawSnowflake(snowflake) {
    ctx.beginPath();
    ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  function updateSnowflake(snowflake) {
    snowflake.y += snowflake.speedY;
    snowflake.x += snowflake.speedX;

    if (snowflake.y > height) {
      snowflake.y = 0;
      snowflake.x = Math.random() * width;
    }
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);
    snowflakes.forEach(snowflake => {
      updateSnowflake(snowflake);
      drawSnowflake(snowflake);
    });
    requestAnimationFrame(loop);
  }

  for (let i = 0; i < 10; i++) {
    snowflakes.push(createSnowflake());
  }

  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });

  loop();