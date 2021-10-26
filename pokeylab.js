class POKEYLab {
	constructor() {
		this.ready = false;
		this.playing = false;
	}
	
	init() {
		if (this.ready) return;
		this.context = new AudioContext({ sampleRate: 56000 });
		this.context.audioWorklet.addModule('./web-pokey/pokey.js').then(() => {
			this.node = new AudioWorkletNode(this.context, "POKEY");
			this.play();
		});
		this.ready = true;
		this.buttonPlay = document.getElementById("play");
		this.buttonStop = document.getElementById("stop");
	}
	
	play() {
		if (!this.ready) {
			this.init();
			return;
		}
		if (!this.playing) {
			this.playing = true;
			this.node.connect(this.context.destination);
			this.buttonStop.disabled = false;
			this.buttonPlay.disabled = true;
		}
		this.update();
	}
	
	stop() {
		if (!this.playing) return;
		this.playing = false;
		this.node.disconnect(this.context.destination);
		this.buttonStop.disabled = true;
		this.buttonPlay.disabled = false;
	}
	
	update(reg) {
		reg = [
			parseInt(document.getElementById("audf1_hex").value, 16),
			parseInt(document.getElementById("audc1_hex").value, 16),
			parseInt(document.getElementById("audf2_hex").value, 16),
			parseInt(document.getElementById("audc2_hex").value, 16),
			parseInt(document.getElementById("audf3_hex").value, 16),
			parseInt(document.getElementById("audc3_hex").value, 16),
			parseInt(document.getElementById("audf4_hex").value, 16),
			parseInt(document.getElementById("audc4_hex").value, 16),
			parseInt(document.getElementById("audctl_hex").value, 16)
		];
		this.node.port.postMessage([
			0, reg[0], 0, 1, reg[1], 0, 2, reg[2], 0,
			3, reg[3], 0, 4, reg[4], 0, 5, reg[5], 0,
			6, reg[6], 0, 7, reg[7], 0, 8, reg[8], 0,
			9, reg[9], 0
		]);
	}
	
	pause() {
		if (this.playing) this.context.suspend();
	}
	
	resume() {
		if (this.playing) this.context.resume();
	}
	
}

var PL = new POKEYLab();
var PLForm = {};

PLForm.init = function() {
	let names = [
		"audf1_hex","audc1_hex","audf2_hex","audc2_hex","audf3_hex","audc3_hex","audf4_hex","audc4_hex",
		"audf1_dec","audf2_dec","audf3_dec","audf4_dec","audc1_bin","audc2_bin","audc3_bin","audc4_bin",
		"audc1_poly","audc2_poly","audc3_poly","audc4_poly","audc1_volonly","audc2_volonly","audc3_volonly",
		"audc4_volonly","audc1_vol","audc2_vol","audc3_vol","audc4_vol",
		"audctl_hex", "audctl_bin", "audctl_poly","audctl_ch1freq","audctl_ch3freq","audctl_16bit21",
		"audctl_16bit43","audctl_filter13","audctl_filter24","audctl_freq"
	];
	for (let i = 0; i < names.length; i++) {
		this[names[i]] = document.getElementById(names[i]);
	}
	// Add events
	let is;
	is = [
		"audf1_hex", "audc1_hex", "audf2_hex", "audc2_hex",
		"audf3_hex", "audc3_hex", "audf4_hex", "audc4_hex",
		"audctl_hex"
	];
	for (let i = 0; i < is.length; i++) {
		this[is[i]].addEventListener("input",() => { PLForm.updateHR(); });
	}
	if (document.location.hash) {
		let hash = document.location.hash.substring(1).split(",").map((n) => { return parseInt(n,16); });
		for (let i = 0; i < is.length; i++) {
			this[is[i]].value = (isNaN(hash[i]) ? 0 : hash[i]).toString(16).toUpperCase().padStart(2,"0");
		}
		PLForm.updateHR();
	}
	is = [
		"audf1_dec", "audf2_dec", "audf3_dec", "audf4_dec",
		"audc1_bin", "audc2_bin", "audc3_bin", "audc4_bin",
		"audc1_poly", "audc2_poly", "audc3_poly", "audc4_poly",
		"audc1_volonly", "audc2_volonly", "audc3_volonly", "audc4_volonly",
		"audc1_vol", "audc2_vol", "audc3_vol", "audc4_vol",
		"audctl_poly","audctl_ch1freq","audctl_ch3freq","audctl_16bit21",
		"audctl_16bit43","audctl_filter13","audctl_filter24","audctl_freq"
	];
	for (let i = 0; i < is.length; i++) this[is[i]].addEventListener("input",() => { PLForm.updateHex(); });
}

PLForm.updateHR = function() {
	for (let i = 1; i <= 4; i++) {
		this["audf"+i+"_hex"].value = this["audf"+i+"_hex"].value.toUpperCase();
		let v = parseInt(this["audf"+i+"_hex"].value, 16);
		if (isNaN(v) || v < 0) v = 0;
		if (v > 255) v = 255;
		this["audf"+i+"_dec"].value = v;
		
		this["audc"+i+"_hex"].value = this["audc"+i+"_hex"].value.toUpperCase();
		v = parseInt(this["audc"+i+"_hex"].value, 16);
		if (isNaN(v) || v < 0) v = 0;
		if (v > 255) v = 255;
		
		this["audc"+i+"_bin"].value = v.toString(2).padStart(8,"0");
		
		this["audc"+i+"_poly"].value = (v >> 5);
		this["audc"+i+"_volonly"].checked = ((v >> 4) & 1) == 1;
		this["audc"+i+"_vol"].value = v & 0xF;
	}
	
	let v = parseInt(this["audctl_hex"].value, 16);
	this["audctl_hex"].value = this["audctl_hex"].value.toUpperCase();
	if (isNaN(v) || v < 0) v = 0;
	if (v > 255) v = 255;
	
	this["audctl_bin"].value = v.toString(2).padStart(8,"0");
	
	this["audctl_poly"].value = v >> 7 & 1;
	this["audctl_ch1freq"].value = v >> 6 & 1;
	this["audctl_ch3freq"].value = v >> 5 & 1;
	this["audctl_16bit21"].checked = v >> 4 & 1;
	this["audctl_16bit43"].checked = v >> 3 & 1;
	this["audctl_filter13"].checked = v >> 2 & 1;
	this["audctl_filter24"].checked = v >> 1 & 1;
	this["audctl_freq"].value = v & 1;
	PLForm.updateHash();
	if (PL.playing) PL.update();
}

PLForm.updateHex = function() {
	for (let i = 1; i <= 4; i++) {
		let v = parseInt(this["audf"+i+"_dec"].value);
		if (isNaN(v) || v < 0) v = 0;
		if (v > 255) v = 255;
		this["audf"+i+"_dec"].value = v;
		this["audf"+i+"_hex"].value = v.toString(16).toUpperCase().padStart(2,"0");
		
		let poly = parseInt(this["audc"+i+"_poly"].value);
		let vo = this["audc"+i+"_volonly"].checked ? 1 : 0;
		v = parseInt(this["audc"+i+"_vol"].value);
		if (isNaN(v) || v < 0) v = 0;
		if (v > 15) v = 15;
		this["audc"+i+"_vol"].value = v;
		
		v = (poly << 5) + (vo << 4) + v;
		this["audc"+i+"_hex"].value = v.toString(16).toUpperCase().padStart(2,"0");
		this["audc"+i+"_bin"].value = v.toString(2).padStart(8,"0");
	}
	
	
	let v = parseInt(this["audctl_poly"].value) << 7;
	v += parseInt(this["audctl_ch1freq"].value) << 6;
	v += parseInt(this["audctl_ch3freq"].value) << 5;
	v += (this["audctl_16bit21"].checked ? 1 : 0) << 4;
	v += (this["audctl_16bit43"].checked ? 1 : 0) << 3;
	v += (this["audctl_filter13"].checked ? 1 : 0) << 2;
	v += (this["audctl_filter24"].checked ? 1 : 0) << 1;
	v += parseInt(this["audctl_freq"].value);
	this["audctl_hex"].value = v.toString(16).toUpperCase().padStart(2,"0");
	this["audctl_bin"].value = v.toString(2).padStart(8,"0");
	PLForm.updateHash();
	if (PL.playing) PL.update();
}

PLForm.updateHash = function() {
	let reg = [
		document.getElementById("audf1_hex").value, document.getElementById("audc1_hex").value,
		document.getElementById("audf2_hex").value, document.getElementById("audc2_hex").value,
		document.getElementById("audf3_hex").value, document.getElementById("audc3_hex").value,
		document.getElementById("audf4_hex").value, document.getElementById("audc4_hex").value,
		document.getElementById("audctl_hex").value
	];
	document.location.hash = reg.join(",");
}

PLForm.reset = function() {
	let is = [
		"audf1_hex", "audc1_hex", "audf2_hex", "audc2_hex",
		"audf3_hex", "audc3_hex", "audf4_hex", "audc4_hex",
		"audctl_hex"
	];
	for (let i = 0; i < is.length; i++) this[is[i]].value = "00";
	PLForm.updateHR();
	PLForm.updateHash();
	if (PL.playing) PL.update();
}

PLForm.random = function() {
	let is = [
		"audf1_hex", "audc1_hex", "audf2_hex", "audc2_hex",
		"audf3_hex", "audc3_hex", "audf4_hex", "audc4_hex",
		"audctl_hex"
	];
	for (let i = 0; i < is.length; i++) {
		this[is[i]].value = Math.floor(Math.random()*255).toString(16).toUpperCase().padStart(2,"0");
	}
	PLForm.updateHR();
	PLForm.updateHash();
	if (PL.playing) PL.update();
}

document.addEventListener("DOMContentLoaded", function(e){
	document.getElementById("play").addEventListener("click",()=>{ PL.play(); });
	document.getElementById("stop").addEventListener("click",()=>{ PL.stop(); });
	document.getElementById("reset").addEventListener("click",()=>{ PLForm.reset(); });
	document.getElementById("random").addEventListener("click",()=>{ PLForm.random(); });
	document.getElementById("stop").disabled = true;
	PLForm.init();
});

document.addEventListener("visibilitychange", function() {
	document.hidden ? PL.pause() : PL.resume();
});
