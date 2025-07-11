package com.heithered.loans.util;


import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.nio.ByteBuffer;
import java.util.UUID;

@Component
public class UUIDToByteArrayConverter implements Converter<UUID, byte[]> {
    @Override
    public byte[] convert(UUID source) {
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(source.getMostSignificantBits());
        bb.putLong(source.getLeastSignificantBits());
        return bb.array();
    }
}
