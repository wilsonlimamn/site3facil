import { getCachedAccessToken } from './auth';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

const DRIVE_FILE_NAME = 'carcontrole_database.json';
const DRIVE_SQLITE_FILE_NAME = 'carcontrole_database.sqlite';

/**
 * Searches if the app file exists in user's Google Drive
 */
export async function findDriveDatabaseFile(token?: string): Promise<DriveFileInfo | null> {
  const accessToken = token || getCachedAccessToken();
  if (!accessToken) {
    throw new Error('Usuário não autenticado no Google');
  }

  const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' or name = '${DRIVE_SQLITE_FILE_NAME}' and trashed = false`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Falha ao buscar arquivos no Google Drive: ${errText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0];
  }

  return null;
}

/**
 * Uploads/Saves the database to user's Google Drive (creates or updates)
 */
export async function saveDatabaseToDrive(
  payloadData: object | string,
  token?: string
): Promise<DriveFileInfo> {
  const accessToken = token || getCachedAccessToken();
  if (!accessToken) {
    throw new Error('Token de acesso do Google Drive não encontrado. Faça login novamente.');
  }

  const fileContent = typeof payloadData === 'string' ? payloadData : JSON.stringify(payloadData, null, 2);
  const existingFile = await findDriveDatabaseFile(accessToken).catch(() => null);

  if (existingFile) {
    // Update existing file (PATCH)
    const updateResponse = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: fileContent,
      }
    );

    if (!updateResponse.ok) {
      const errText = await updateResponse.text();
      throw new Error(`Falha ao atualizar arquivo no Google Drive: ${errText}`);
    }

    const updated = await updateResponse.json();
    return {
      id: updated.id || existingFile.id,
      name: DRIVE_FILE_NAME,
      modifiedTime: new Date().toISOString(),
      size: `${new Blob([fileContent]).size} B`,
    };
  } else {
    // Create new file via Multipart upload (POST)
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: DRIVE_FILE_NAME,
      mimeType: 'application/json',
      description: 'Banco de dados pessoal do CarControle (Veículos, Manutenções, Alertas e Abastecimentos)',
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const createResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!createResponse.ok) {
      const errText = await createResponse.text();
      throw new Error(`Falha ao criar arquivo no Google Drive: ${errText}`);
    }

    const created = await createResponse.json();
    return created;
  }
}

/**
 * Downloads and reads the database file from user's Google Drive
 */
export async function downloadDatabaseFromDrive(fileId: string, token?: string): Promise<any> {
  const accessToken = token || getCachedAccessToken();
  if (!accessToken) {
    throw new Error('Token de acesso do Google Drive não encontrado.');
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Falha ao baixar arquivo do Google Drive: ${errText}`);
  }

  const rawText = await response.text();
  try {
    return JSON.parse(rawText);
  } catch (err) {
    return rawText;
  }
}
