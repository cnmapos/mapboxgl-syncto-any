const { Cartographic, Ellipsoid, Ion, UrlTemplateImageryProvider, Viewer, WebMercatorTilingScheme, Math: CMath } = Cesium;

export async function anyMapSetup(params: { container: HTMLElement }): Promise<Viewer> {
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MmM2NzE1MS1hZmY4LTRjZjAtYjU0OS01ZmYxNTUyN2RmZTkiLCJpZCI6MTAyMDM4LCJpYXQiOjE2NTg0MjAyMDh9._4bKrmIJqaK2-Q4gwnR7FE7Ldgl920_n5BHZvTu4MPE';

    const viewer = new Viewer(params.container, {
        baseLayerPicker: false,
        sceneModePicker: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        navigationHelpButton: false,
        infoBox: false,
        scene3DOnly: true,
    });

    viewer._cesiumWidget._creditContainer.style.display = "none";// 隐藏版权
    const key = '39673271636382067f0b0937ab9a9677';
    viewer.imageryLayers.addImageryProvider(
        new UrlTemplateImageryProvider({  
            url: `https://t{s}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${key}`,
            subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],  
            tilingScheme: new WebMercatorTilingScheme(),
            maximumLevel: 20,    
        })
    );
    viewer.imageryLayers.get(0).show = true;
    initCameraView(viewer);

    return viewer;
}

function initCameraView(viewer: Viewer) {
    // 定义你想要定位到的坐标（经度、纬度、高度）  
    const longitude = 104.061891 // 例如，洛杉矶的经度  
    const latitude = 30.65796;    // 洛杉矶的纬度  
    const height = 1000;         // 设置的高度，单位为米  

    const cartographic = Cartographic.fromDegrees(longitude, latitude, height);  
    const position = Ellipsoid.WGS84.cartographicToCartesian(cartographic);  
  
    viewer.camera.setView({  
        destination: position, // 相机目标位置  
        orientation: {  
            heading: CMath.toRadians(0.0), // 航向角，东向为0度  
            pitch: CMath.toRadians(-90.0), // 俯仰角，向下看为-90度  
            roll: 0.0                           // 翻滚角  
        }  
    }); 
}