const JAMENDO_CLIENT_ID =
  process.env.JAMENDO_CLIENT_ID || "709fa152";

const REQUEST_TIMEOUT = 8000;

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function clean(value, max = 120) {
  return String(value || "")
    .trim()
    .slice(0, max);
}

function timeoutSignal(ms) {
  return AbortSignal.timeout(ms);
}

/* -----------------------------
   BUILD MUSIC SEARCHES
----------------------------- */

function buildSearches(request) {
  const text = clean(request).toLowerCase();

  const searches = [];

  if (/cinematic|movie|film|dramatic/.test(text)) {
    searches.push({
      fuzzytags: "cinematic soundtrack"
    });

    searches.push({
      fuzzytags: "dramatic soundtrack"
    });
  }

  if (/motivational|motivation|inspiring|inspiration/.test(text)) {
    searches.push({
      fuzzytags: "motivational rock"
    });

    searches.push({
      fuzzytags: "energetic rock"
    });
  }

  if (/calm|relax|peaceful|piano/.test(text)) {
    searches.push({
      fuzzytags: "calm piano"
    });

    searches.push({
      fuzzytags: "ambient relaxation"
    });
  }

  if (/energetic|energy|workout|gym|fast/.test(text)) {
    searches.push({
      fuzzytags: "energetic electronic"
    });

    searches.push({
      fuzzytags: "energetic rock"
    });
  }

  if (/romantic|love/.test(text)) {
    searches.push({
      fuzzytags: "romantic acoustic"
    });

    searches.push({
      fuzzytags: "romantic piano"
    });
  }

  /* Always have a general fallback */
  searches.push({
    fuzzytags: "soundtrack"
  });

  searches.push({
    tags: "instrumental"
  });

  return searches.slice(0, 5);
}

/* -----------------------------
   JAMENDO SEARCH
----------------------------- */

async function searchJamendo(params) {
  const url = new URL(
    "https://api.jamendo.com/v3.0/tracks/"
  );

  url.searchParams.set(
    "client_id",
    JAMENDO_CLIENT_ID
  );

  url.searchParams.set(
    "format",
    "json"
  );

  url.searchParams.set(
    "limit",
    "10"
  );

  url.searchParams.set(
    "audioformat",
    "mp32"
  );

  url.searchParams.set(
    "type",
    "single albumtrack"
  );

  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      url.searchParams.set(
        key,
        value
      );
    }
  }

  const response = await fetch(url, {
    method: "GET",
    signal: timeoutSignal(
      REQUEST_TIMEOUT
    )
  });

  if (!response.ok) {
    throw new Error(
      `Jamendo HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  if (
    !data ||
    !Array.isArray(data.results)
  ) {
    return [];
  }

  return data.results;
}

/* -----------------------------
   FILTER TRACKS
----------------------------- */

function usableTracks(tracks) {
  const seen =
    new Set();

  const output = [];

  for (const track of tracks) {
    if (
      !track ||
      !track.id
    ) {
      continue;
    }

    if (
      !track.audio
    ) {
      continue;
    }

    if (
      track.audiodownload_allowed === false
    ) {
      continue;
    }

    const id =
      String(track.id);

    if (
      seen.has(id)
    ) {
      continue;
    }

    seen.add(id);

    output.push(track);
  }

  return output;
}

/* -----------------------------
   SEARCH HANDLER
----------------------------- */

async function handleSearch(request) {
  const url =
    new URL(request.url);

  const query =
    clean(
      url.searchParams.get(
        "query"
      )
    );

  const searches =
    buildSearches(query);

  /*
   Run searches in parallel instead
   of waiting for each one.
  */

  const results =
    await Promise.allSettled(
      searches.map(
        (params) =>
          searchJamendo(params)
      )
    );

  const candidates = [];

  for (const result of results) {
    if (
      result.status ===
      "fulfilled"
    ) {
      candidates.push(
        ...result.value
      );
    }
  }

  const tracks =
    usableTracks(
      candidates
    ).slice(0, 15);

  if (!tracks.length) {
    return json(
      {
        ok: false,
        error:
          "YARUVA could not find suitable music right now."
      },
      404
    );
  }

  return json({
    ok: true,

    tracks:
      tracks.map(
        (track) => ({
          id:
            String(track.id),

          name:
            track.name ||
            "Untitled",

          artist_name:
            track.artist_name ||
            "Unknown artist",

          duration:
            Number(
              track.duration
            ) || 0,

          license_ccurl:
            track.license_ccurl ||
            "",

          audiodownload_allowed:
            track.audiodownload_allowed !== false
        })
      )
  });
}

/* -----------------------------
   STREAM HANDLER
----------------------------- */

async function handleStream(request) {
  const url =
    new URL(request.url);

  const id =
    clean(
      url.searchParams.get(
        "id"
      ),
      30
    );

  if (
    !/^\d+$/.test(id)
  ) {
    return json(
      {
        ok: false,
        error:
          "Invalid music track ID."
      },
      400
    );
  }

  const jamendoURL =
    new URL(
      "https://api.jamendo.com/v3.0/tracks/file/"
    );

  jamendoURL.searchParams.set(
    "client_id",
    JAMENDO_CLIENT_ID
  );

  jamendoURL.searchParams.set(
    "id",
    id
  );

  jamendoURL.searchParams.set(
    "audioformat",
    "mp32"
  );

  jamendoURL.searchParams.set(
    "action",
    "stream"
  );

  const upstream =
    await fetch(
      jamendoURL,
      {
        method: "GET",
        redirect: "follow",
        signal:
          timeoutSignal(
            12000
          )
      }
    );

  if (
    !upstream.ok ||
    !upstream.body
  ) {
    return json(
      {
        ok: false,
        error:
          `Music stream unavailable (${upstream.status}).`
      },
      502
    );
  }

  const headers =
    new Headers(
      corsHeaders()
    );

  headers.set(
    "Content-Type",
    upstream.headers.get(
      "content-type"
    ) ||
      "audio/mpeg"
  );

  headers.set(
    "Content-Disposition",
    "inline"
  );

  const length =
    upstream.headers.get(
      "content-length"
    );

  if (length) {
    headers.set(
      "Content-Length",
      length
    );
  }

  return new Response(
    upstream.body,
    {
      status: 200,
      headers
    }
  );
}

/* -----------------------------
   MAIN API
----------------------------- */

export default async function handler(
  request
) {
  if (
    request.method ===
    "OPTIONS"
  ) {
    return new Response(
      null,
      {
        status: 204,
        headers:
          corsHeaders()
      }
    );
  }

  if (
    request.method !==
    "GET"
  ) {
    return json(
      {
        ok: false,
        error:
          "Method not allowed."
      },
      405
    );
  }

  try {
    const url =
      new URL(request.url);

    if (
      url.searchParams.get(
        "mode"
      ) === "stream"
    ) {
      return await handleStream(
        request
      );
    }

    return await handleSearch(
      request
    );

  } catch (error) {
    console.error(
      "YARUVA Music API Error:",
      error
    );

    return json(
      {
        ok: false,
        error:
          error?.message ||
          "Music service error."
      },
      500
    );
  }
}
