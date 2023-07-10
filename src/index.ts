

// Import the custom gameplay code.
import { initGamePlay } from "./gameplay";
import "./polyfill/delcares";
import { initStatic } from "./scene";
import { setupUi } from "./ui";
import { MeshCollider, Transform, engine, InputAction, Material, MeshRenderer, PointerEventType, inputSystem, pointerEventsSystem } from '@dcl/sdk/ecs'
import { movePlayerTo } from '~system/RestrictedActions'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { height, sceneSizeX, sceneSizeZ, radiusMultiplier } from './resources' 

// export all the functions required to make the scene work
export * from '@dcl/sdk'

export function main(){
    //initStatic() 
    initGamePlay() 
    setupUi()
	
    //#region SkyBox
	//root
	let skyboxRoot = engine.addEntity()
	Transform.create(skyboxRoot, { position: Vector3.create(sceneSizeX / 2, height / 2, sceneSizeZ / 2) })

	//front
	let skyboxPZ = engine.addEntity()
	Transform.create(skyboxPZ, {
		position: Vector3.create(0, 0, sceneSizeZ / 2 * radiusMultiplier),
		scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
		parent: skyboxRoot
	})
	MeshRenderer.setPlane(skyboxPZ)
	Material.setBasicMaterial(skyboxPZ, {
		texture: Material.Texture.Common({
			src: "images/skybox/pz.png"
		})
	})

	//back
	let skyboxNZ = engine.addEntity()
	Transform.create(skyboxNZ, {
		position: Vector3.create(0, 0, -sceneSizeZ / 2 * radiusMultiplier),
		rotation: Quaternion.fromEulerDegrees(0, 180, 0),
		scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
		parent: skyboxRoot
	})
	MeshRenderer.setPlane(skyboxNZ)
	Material.setBasicMaterial(skyboxNZ, {
		texture: Material.Texture.Common({
			src: "images/skybox/nz.png"
		})
	})

	//Top
	let skyboxPY = engine.addEntity()
	Transform.create(skyboxPY, {
		position: Vector3.create(0, height / 2 * radiusMultiplier, 0),
		rotation: Quaternion.fromEulerDegrees(-90, 0, 0),
		scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
		parent: skyboxRoot
	})
	MeshRenderer.setPlane(skyboxPY)
	Material.setBasicMaterial(skyboxPY, {
		texture: Material.Texture.Common({
			src: "images/skybox/py.png"
		})
	})

	//Bottom
	let skyboxNY = engine.addEntity()
	Transform.create(skyboxNY, {
		position: Vector3.create(0, -height / 2 * radiusMultiplier, 0),
		rotation: Quaternion.fromEulerDegrees(90, 0, 0),
		scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
		parent: skyboxRoot
	})
	MeshRenderer.setPlane(skyboxNY)
	Material.setBasicMaterial(skyboxNY, {
		texture: Material.Texture.Common({
			src: "images/skybox/ny.png"
		})
	})

	//Right
	let skyboxPX = engine.addEntity()
	Transform.create(skyboxPX, {
		position: Vector3.create(sceneSizeX / 2 * radiusMultiplier, 0, 0),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0),
		scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
		parent: skyboxRoot
	})
	MeshRenderer.setPlane(skyboxPX)
	Material.setBasicMaterial(skyboxPX, {
		texture: Material.Texture.Common({
			src: "images/skybox/px.png"
		})
	})

	// Left
	let skyboxNX = engine.addEntity()
	Transform.create(skyboxNX, {
		position: Vector3.create(-sceneSizeX / 2 * radiusMultiplier, 0, 0),
		rotation: Quaternion.fromEulerDegrees(0, -90, 0),
		scale: Vector3.create(sceneSizeX * radiusMultiplier, height * radiusMultiplier, sceneSizeZ * radiusMultiplier),
		parent: skyboxRoot
	})
	MeshRenderer.setPlane(skyboxNX)
	Material.setBasicMaterial(skyboxNX, {
		texture: Material.Texture.Common({
			src: "images/skybox/nx.png"
		})
	})
	//#endregion

}