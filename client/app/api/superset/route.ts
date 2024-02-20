import axios from "axios";
import { NextResponse } from "next/server";
import {
  supersetCredentials,
  dashboardId,
} from "@/app/dashboard/composer/bundled-composer/utils/supersetCredentials";

export async function GET() {
  try {
    const loginTokenPayload = {
      username: supersetCredentials.username,
      password: supersetCredentials.password,
      provider: "db",
      refresh: true,
    };

    const guestTokenPayload = {
      resources: [
        {
          type: "dashboard",
          id: dashboardId,
        },
      ],
      rls: [],
      user: {
        username: "dashboard_viewer",
        first_name: "Dashboard",
        last_name: "Viewer",
      },
    };

    const loginTokenResponse = await axios.post(
      "https://superset.worlds.org/api/v1/security/login",
      loginTokenPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const loginToken = await loginTokenResponse.data.access_token;

    const guestTokenResponse = await axios.post(
      "https://superset.worlds.org/api/v1/security/guest_token/",
      guestTokenPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + loginToken,
        },
        withCredentials: true,
      }
    );

    const token = await guestTokenResponse.data.token;

    return NextResponse.json({ token: token });
  } catch (error) {
    return NextResponse.json({ error: "Error while loading superset" });
  }
}
