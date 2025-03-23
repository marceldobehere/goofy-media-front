# Goofy Media

This is the frontend for Goofy Media.

Statically hosted [here](https://marceldobehere.github.io/goofy-media-front/).

If you want to register an account, just send me a message on discord or reach out.

![home](./imgs/home.png)


Backend: https://github.com/marceldobehere/goofy-media-back

### Local Dev
You need node to run this
* Clone the repo and navigate to the folder
* `npm i`
* `npm run dev`
* Visit the website being logged, usually http://localhost:3010/goofy-media-front
* Profit


### Styling Info
Posts can be styled using markdown.
```
# Hi
This is a *very* **cool** text.

* This
* is
* a
* list

## Bla Bla
yes this also works

```

Additionally, pictures, videos and audios can be embedded using `![alt text](url)`

Embedded media can autoload depending on the user settings. Autoloading is off by default for security reasons.

There is also syntax highlighting for code blocks

Custom css can also be added for blocks by using the following `<style "...">...</style>` "element":
```html
<style "border:4px solid red;width:250px;height:350px;font-family:'Comic Sans MS';background:radial-gradient(red, green, blue);">
  This is a test element
  It is very cool
</style>
```
Most properties will work just fine. Notable exclusions are `position` and any URLs.
