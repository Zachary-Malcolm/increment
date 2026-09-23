// Real datasets used by lessons. Files live in public/data; setup code (run before the learner's code)
// loads them into friendly Python values.

/**
 * Palmer Penguins: 344 penguins observed at Palmer Station, Antarctica, 2007-2009.
 * Gorman KB, Williams TD, Fraser WR (2014), via the palmerpenguins package by Horst, Hill & Gorman.
 * Licence: CC0 (public domain).
 */
export const PENGUINS_FILE = 'penguins.csv';

/** Defines `penguins`: a list of dicts, one per penguin. Missing values ("NA" in the file) become None. */
export const PENGUINS_SETUP = `
import csv as _csv
_types = {"bill_length_mm": float, "bill_depth_mm": float, "flipper_length_mm": int, "body_mass_g": int, "year": int}
with open("data/penguins.csv") as _f:
    penguins = [
        {key: (None if text == "NA" else _types.get(key, str)(text)) for key, text in row.items()}
        for row in _csv.DictReader(_f)
    ]
del _csv, _types, _f
`;

/** Setup that also defines `masses`: body masses (g) of every Adelie penguin with a recorded mass. */
export const ADELIE_MASSES_SETUP = `${PENGUINS_SETUP}
masses = [p["body_mass_g"] for p in penguins if p["species"] == "Adelie" and p["body_mass_g"] is not None]
del penguins
`;

/** Loads penguins as a pandas DataFrame (missing values become NaN). */
export const PENGUINS_DF_SETUP = `import pandas as pd
penguins = pd.read_csv("data/penguins.csv")
`;

/**
 * Gapminder: life expectancy, population and GDP per person for 142 countries, every 5 years 1952-2007.
 * From the gapminder R package by Jennifer Bryan (CC0); data from Gapminder.org (CC BY 4.0).
 * Columns: country, continent, year, life_exp, pop, gdp_per_cap
 */
export const GAPMINDER_FILE = 'gapminder.csv';
export const GAPMINDER_DF_SETUP = `import pandas as pd
gapminder = pd.read_csv("data/gapminder.csv")
`;

/**
 * Oxford weather: monthly readings from the Radcliffe Observatory, Oxford, 1853-2025. Met Office historic
 * station data, Open Government Licence v3.0. Estimated values are kept; missing values are blank.
 * Columns: year, month, tmax_c, tmin_c, frost_days, rain_mm, sun_hours
 */
export const WEATHER_FILE = 'oxford_weather.csv';
export const WEATHER_DF_SETUP = `import pandas as pd
weather = pd.read_csv("data/oxford_weather.csv")
`;

export const PENGUINS_CREDIT =
  'Data: Palmer Penguins (Gorman, Williams & Fraser 2014; palmerpenguins package by Horst, Hill & Gorman), public domain (CC0).';
