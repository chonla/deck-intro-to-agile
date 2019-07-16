Deck
=====

## Install deck

Use `npm install` or `yarn install` as you wish.

## Create a new deck

1. Put slide files into a directory, for example, `./slides`.
2. Bundle slides into deck by create a deck configuration file. for example, `sample-deck.json`.

## Start your deck

Use `npm run serve --deck=sample-deck.json` if you install deck with npm or `yarn serve --deck=sample-deck.json` if you use yarn.

## Deck configuration file format

```
{
    "title": "Your deck title",
    "assets": [
        "assets/**"
    ],
    "styles": [
        "assets/css/default.css"
    ],
    "files": [
        "slides/file1",
        "slides/file2",
        "slides/file3"
    ]
}
```

* `title` is your deck title
* `assets` is a list of your assets to be used in your slides.
* `styles` is additional style sheets to be embed in your presentation.
* `files` is a list of your slide files. Each file will be placed as how you order.

## License

MIT