package com.heithered.loans.util;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.nio.ByteBuffer;
import java.util.UUID;

@Component
public class HeapByteBufferToUUIDConverter implements Converter<ByteBuffer, UUID> {
    @Override
    public UUID convert(ByteBuffer source) {
        if (source.remaining() < 16) {
            throw new IllegalArgumentException("ByteBuffer must contain at least 16 bytes for UUID conversion.");
        }

        // Ensure the buffer is in the correct position
        long high = source.getLong();
        long low = source.getLong();

        return new UUID(high, low);
    }
}
