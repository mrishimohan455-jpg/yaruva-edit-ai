const JAMENDO_CLIENT_ID = process.env.JAMENDO_CLIENT_ID || "709fa152";

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
  return String(value || "").trim().slice(0, max);
}

function buildSearches(request) {
  const text = clean(request).toLowerCase();
  const searches = [];

  if (text) {
    searches.push({ search: text });
  }

  if (/cinematic|movie|film|dramatic/.test(text)) {
    searches.push({ fuzzytags: "cinematic soundtrack" });
    searches.push({ fuzzytags: "soundtrack dramatic" });
  }

  if (/motivational|motivation|inspiring|inspiration/.test(text)) {
    searches.push({ fuzzytags: "rock motivational" });
    searches.push({ fuzzytags: "rock energetic" });
  }

  if (/calm|relax|peaceful|piano/.test(text)) {
    searches.push({ fuzzytags: "relaxation piano" });
    searches.push({ fuzzytags: "ambient calm" });
  }

  if (/energetic|energy|workout|gym|fast/.test(text)) {
    searches.push({ fuzzytags: "electronic energetic" });
    searches.push({ fuzzytags: "rock energetic" });
  }

  if (/romantic|love/.test(text)) {
    searches.push({ fuzzytags: "romantic acoustic" });
    searches.push({ fuzzytags: "romantic piano" });
  }

  searches.push({ fuzzytags: "soundtrack" });
  searches.push({ tags: "instrumental" });

  return searches;
}

async function searchJamendo(params) {
  const url = new URL(
    "https://api.jamendo.com/v3.0/tracks/"
  );

  url.searchParams.set("client_id", JAMENDO_CLIENT_ID);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "15");
  url.searchParams.set("audioformat", "mp32");
  url.searchParams.set("type", "single albumtrack");

  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Jamendo search failed: HTTP ${response.status}`
    );
  }

  const data = await response.json();

  return Array.isArray(data.results)
    ? data.results
    : [];
}

function usableTracks(tracks) {
  const seen = new Set();

  return tracks.filter((track) => {
    if (!track || !track.id) return false;

    if (!track.audio) return false;

    if (track.audiodownload_allowed === false) {
      return false;
    }

    const id = String(track.id);

    if (seen.has(id)) {
      return false;
    }

    seen.add(id);

    return true;
  });
}

async function handleSearch(request) {
  const url = new URL(request.url);

  const query = clean(
    url.searchParams.get("query")
  );

  const candidates = [];

  for (const params of buildSearches(query)) {
    try {
      const tracks = usableTracks(
        await searchJamendo(params)
      );

      candidates.push(...tracks);

      if (candidates.length >= 20) {
        break;
      }
    } catch (error) {
      console.warn(
        "Jamendo search candidate failed",
        error
      );
    }
  }

  const finalTracks = usableTracks(
    candidates
  ).slice(0, 20);

  if (!finalTracks.length) {
    return json(
      {
        ok: false,
        error: "No usable music was found."
      },
      404
    );
  }

  return json({
    ok: true,

    tracks: finalTracks.map((track) => ({
      id: String(track.id),

      name:
        track.name ||
        "Untitled",

      artist_name:
        track.artist_name ||
        "Unknown artist",

      duration:
        Number(track.duration) ||
        0,

      license_ccurl:
        track.license_ccurl ||
        "",

      audiodownload_allowed:
        track.audiodownload_allowed !== false
    }))
  });
}

async function handleStream(request) {
  const url = new URL(request.url);

  const id = clean(
    url.searchParams.get("id"),
    30
  );

  if (!/^\d+$/.test(id)) {
    return json(
      {
        ok: false,
        error: "A valid track id is required."
      },
      400
    );
  }

  const jamendoFileUrl = new URL(
    "https://api.jamendo.com/v3.0/tracks/file/"
  );

  jamendoFileUrl.searchParams.set(
    "client_id",
    JAMENDO_CLIENT_ID
  );

  jamendoFileUrl.searchParams.set(
    "id",
    id
  );

  jamendoFileUrl.searchParams.set(
    "audioformat",
    "mp32"
  );

  jamendoFileUrl.searchParams.set(
    "action",
    "stream"
  );

  const upstream = await fetch(
    jamendoFileUrl,
    {
      redirect: "follow"
    }
  );

  if (!upstream.ok || !upstream.body) {
    return json(
      {
        ok: false,
        error:
          `Jamendo stream unavailable: HTTP ${upstream.status}`
      },
      upstream.status || 502
    );
  }

  const headers = new Headers(
    corsHeaders()
  );

  headers.set(
    "Content-Type",
    upstream.headers.get(
      "content-type"
    ) || "audio/mpeg"
  );

  const contentLength =
    upstream.headers.get(
      "content-length"
    );

  if (contentLength) {
    headers.set(
      "Content-Length",
      contentLength
    );
  }

  headers.set(
    "Content-Disposition",
    "inline"
  );

  return new Response(
    upstream.body,
    {
      status: 200,
      headers
    }
  );
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  if (request.method !== "GET") {
    return json(
      {
        ok: false,
        error: "Method not allowed."
      },
      405
    );
  }

  try {
    const url = new URL(
      request.url
    );

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
      "YARUVA music API error",
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
