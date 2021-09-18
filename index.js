import * as THREE from './three.module.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1 , 100);
camera.position.set(3, 3, 3);
camera.lookAt(1, 2, 1);
const ambiantLight = new THREE.AmbientLight(0x404040);
scene.add(ambiantLight);
const light = new THREE.PointLight(0xff0000, 1, 100);
light.position.set(50, 50, 50);
scene.add(light);
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var gameIsStarted = false;
var gameHeight = 1.62;
var dificulty = 0.003;
var speed = dificulty * 20;
var latestCube;
var viewLocked = true;
var dificultyWidth = 1;
var points = 0;
var boxPos = [1, -2, 'right', 'normal'];
var colors = ['#ff0000', '#ff6000', '#ffa200', '#ffcc00', '#fffb00', '#d1ff00', '#94ff00', '#43ff00', '#00ff76', '#00ffac', '#00ffda', '#00eeff', '#00b8ff', '#006eff', '#2000ff', '#9000ff', '#d900ff', '#ff00f7', '#ff00b1', '#ff0077', 0];
function newBox(_color, pos, height, width) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: _color });
    const box = new THREE.Mesh(geometry, material);
    box.position.set(pos[0], pos[1], pos[2]);
    box.scale.y = height;
    box.scale.x = width;
    box.scale.z = width;
    return box;
}
const baseCube = newBox("#383838", [1, 0, 1], 3, 1);
var oldCube = baseCube;
scene.add(baseCube);
if(localStorage.getItem('block_game_record')) {
    document.getElementById('record').innerHTML = `Better score : ${localStorage.getItem('block_game_record')}`;
}
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    if(latestCube) {
        if(boxPos[2] === 'right') {
            if(boxPos[3] === 'normal') {
                latestCube.position.z += speed;
                if(latestCube.position.z >= 3) boxPos[3] = 'back';
            } else {
                latestCube.position.z -= speed;
                if(latestCube.position.z <= -2) boxPos[3] = 'normal';
            }
        } else {
            if(boxPos[3] === 'normal') {
                latestCube.position.x += speed;
                if(latestCube.position.x >= 3) boxPos[3] = 'back';
            } else {
                latestCube.position.x -= speed;
                if(latestCube.position.x <= -2) boxPos[3] = 'normal';
            }
        }
    }
}
animate();
window.addEventListener('keydown', (e) => {
    if(e.keyCode === 32) {
        document.querySelector('div.help').innerHTML = '';
        document.querySelector('table').innerHTML = '';
        document.getElementById('points').innerHTML = '0';
        if(!gameIsStarted) {
            gameIsStarted = true;
            latestCube = newBox(colors[colors[colors.length - 1]], [boxPos[0], gameHeight, boxPos[1]], 0.25, 1);
            gameHeight += 0.25;
            colors[colors.length - 1]++;
            scene.add(latestCube);
        } else {
            var oldestCube = oldCube;;
            oldCube = latestCube;
            latestCube = undefined;
            var contact = false
            if(boxPos[2] === 'right') {
                if(oldCube.position.z <= oldestCube.position.z + dificultyWidth && oldCube.position.z >= oldestCube.position.z - dificultyWidth) contact = true;
                else contact = false;
            } else {
                if(oldCube.position.x <= oldestCube.position.x + dificultyWidth && oldCube.position.x >= oldestCube.position.x - dificultyWidth) contact = true;
                else contact = false;
            }
            if(contact) {
                points++;
                document.getElementById('points').innerHTML = points;
                latestCube = newBox(colors[colors[colors.length - 1]], [boxPos[0], gameHeight, boxPos[1]], 0.25, dificultyWidth);
                gameHeight += 0.25;
                colors[colors.length - 1]++;
                if(colors[colors.length - 1] > colors.length - 2) colors[colors.length - 1] = 0;
                camera.position.y += 0.25;
                if(boxPos[2] === 'right') {
                    boxPos[2] = 'left';
                    boxPos[0] = -2;
                    boxPos[1] = 1;
                } else {
                    boxPos[2] = 'right';
                    boxPos[0] = 1;
                    boxPos[1] = -2;
                }
                latestCube.position.set(boxPos[0], latestCube.position.y, boxPos[1]);
                scene.add(latestCube);
                dificultyWidth -= dificulty;
            } else {
                if((localStorage.getItem('block_game_record')) < points) localStorage.setItem('block_game_record', points);
                oldCube.scale.x = 0;
                oldCube.scale.y = 0;
                oldCube.scale.z = 0;
                latestCube = undefined;
                viewLocked = false;
            }
        }

    }
}, false);
document.querySelectorAll('td').forEach(element => {
    element.addEventListener('click', (e) => {
        document.querySelectorAll('td').forEach(all => {
            all.style.fontSize = '16px'
        });
        e.target.style.fontSize = '30px';
        dificulty = parseFloat(e.target.id);
        speed = dificulty * 20;
    }, false);
});
window.addEventListener('wheel', (y) => {
    if(!viewLocked) {
        if(y.deltaY > 0) {
            camera.position.y -= 0.005 * y.deltaY;
        } else {
            camera.position.y += 0.005 * Math.abs(y.deltaY);
        }
    }
}, false);