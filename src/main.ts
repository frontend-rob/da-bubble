import {bootstrapApplication} from "@angular/platform-browser";
import {appConfig} from "./app/app.config";
import {AppComponent} from "./app/app.component";
import {enableProdMode} from "@angular/core";
import {environment} from "./environments/environment.development";

if (environment.production) {
	// 🛑 Disable logs in production
	console.log = () => {};
	console.info = () => {};
	console.warn = () => {};
	// Optional: keep errors visible
	// console.error = () => {};

	enableProdMode();
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
	console.error(err)
);
