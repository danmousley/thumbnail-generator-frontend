import { removeBackground } from '@imgly/background-removal-node';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check for authentication token
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.NEXT_PUBLIC_N8N_API_TOKEN;
    
    if (!expectedToken) {
      return NextResponse.json({ error: 'API token not configured' }, { status: 500 });
    }
    
    if (!authHeader || authHeader !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    console.log('Processing image:', file.name);
    
    const config = {
      debug: false,
      progress: (key: string, current: number, total: number) => {
        const [type, subtype] = key.split(':');
        console.log(
          `${type} ${subtype} ${((current / total) * 100).toFixed(0)}%`
        );
      },
      model: 'medium' as const,
      output: {
        quality: 1.0,
        format: 'image/webp' as const // webp instead of jpeg is used to preserve the transparent background
      }
    };

    console.time('background-removal');
    const blob = await removeBackground(file, config);
    console.timeEnd('background-removal');

    const buffer = await blob.arrayBuffer();
    
    console.log('Image processing completed');

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'image/webp',
        'Content-Disposition': `attachment; filename="processed_${file.name.split('.')[0]}.webp"`,
      },
    });
  } catch (error) {
    console.error('Background removal error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' }, 
      { status: 500 }
    );
  }
} 